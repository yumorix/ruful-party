import { notFound, redirect } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Paper, 
  Tabs, 
  Tab, 
  Button, 
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import Link from 'next/link';
import { 
  getParty, 
  getParticipants, 
  getVotes, 
  getPartySetting, 
  getMatches,
  getSeatingPlan,
  createMatches,
  createOrUpdateSeatingPlan,
  updateParty
} from '@/lib/db/queries';
import { generateMatches } from '@/lib/ai/matchingEngine';
import { generateSeatingPlan } from '@/lib/ai/seatingPlanner';

interface MatchingPageProps {
  params: {
    partyId: string;
  };
}

export default async function MatchingPage({ params }: MatchingPageProps) {
  const { partyId } = params;
  
  const party = await getParty(partyId);
  
  if (!party) {
    notFound();
  }
  
  const participants = await getParticipants(partyId);
  const interimVotes = await getVotes(partyId, 'interim');
  const finalVotes = await getVotes(partyId, 'final');
  const settings = await getPartySetting(partyId);
  const interimMatches = await getMatches(partyId, 'interim');
  const finalMatches = await getMatches(partyId, 'final');
  const interimSeatingPlan = await getSeatingPlan(partyId, 'interim');
  const finalSeatingPlan = await getSeatingPlan(partyId, 'final');
  
  const maleParticipants = participants.filter(p => p.gender === 'male');
  const femaleParticipants = participants.filter(p => p.gender === 'female');
  
  async function handleGenerateInterimMatches() {
    'use server';
    
    if (!settings) {
      throw new Error('パーティの設定が見つかりません');
    }
    
    // Generate matches using AI
    const matchingResult = await generateMatches(participants, interimVotes, 'interim');
    
    // Create match records
    const matchesToCreate = matchingResult.pairs.map(([p1Id, p2Id], index) => ({
      party_id: partyId,
      match_type: 'interim' as const,
      participant1_id: p1Id,
      participant2_id: p2Id,
      table_number: Math.floor(index / 3) + 1, // 3 pairs per table
      seat_positions: {
        p1: index % 3 * 2,
        p2: index % 3 * 2 + 1
      }
    }));
    
    await createMatches(matchesToCreate);
    
    // Generate seating plan
    const seatingPlanResult = await generateSeatingPlan(participants, interimVotes, settings);
    
    await createOrUpdateSeatingPlan({
      party_id: partyId,
      plan_type: 'interim',
      layout_data: seatingPlanResult.layoutData,
      image_url: ''
    });
    
    redirect(`/admin/parties/${partyId}/matching`);
  }
  
  async function handleGenerateFinalMatches() {
    'use server';
    
    if (!settings) {
      throw new Error('パーティの設定が見つかりません');
    }
    
    // Generate matches using AI
    const matchingResult = await generateMatches(participants, finalVotes, 'final');
    
    // Create match records
    const matchesToCreate = matchingResult.pairs.map(([p1Id, p2Id], index) => ({
      party_id: partyId,
      match_type: 'final' as const,
      participant1_id: p1Id,
      participant2_id: p2Id,
      table_number: 0, // Not relevant for final matches
      seat_positions: {}
    }));
    
    await createMatches(matchesToCreate);
    
    // Generate seating plan
    const seatingPlanResult = await generateSeatingPlan(participants, finalVotes, settings);
    
    await createOrUpdateSeatingPlan({
      party_id: partyId,
      plan_type: 'final',
      layout_data: seatingPlanResult.layoutData,
      image_url: ''
    });
    
    redirect(`/admin/parties/${partyId}/matching`);
  }
  
  async function handleChangeMode(mode: 'interim' | 'final' | 'closed') {
    'use server';
    
    await updateParty(partyId, {
      current_mode: mode
    });
    
    redirect(`/admin/parties/${partyId}/matching`);
  }
  
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/admin/parties">パーティ一覧</Link>
        <Link href={`/admin/parties/${partyId}`}>{party.name}</Link>
        <Typography color="text.primary">マッチング</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          マッチング管理
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          現在のモード: {
            party.current_mode === 'interim' ? '中間投票' :
            party.current_mode === 'final' ? '最終投票' :
            'クローズ'
          }
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button 
            variant={party.current_mode === 'interim' ? 'contained' : 'outlined'}
            onClick={() => handleChangeMode('interim')}
            color="primary"
          >
            中間投票モード
          </Button>
          <Button 
            variant={party.current_mode === 'final' ? 'contained' : 'outlined'}
            onClick={() => handleChangeMode('final')}
            color="secondary"
          >
            最終投票モード
          </Button>
          <Button 
            variant={party.current_mode === 'closed' ? 'contained' : 'outlined'}
            onClick={() => handleChangeMode('closed')}
            color="error"
          >
            クローズ
          </Button>
        </Stack>
      </Paper>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={0} aria-label="matching tabs">
          <Tab label="中間マッチング" />
          <Tab label="最終マッチング" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              中間マッチング
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                投票数: {interimVotes.length}
              </Typography>
              <Typography variant="body2" gutterBottom>
                マッチング数: {interimMatches.length}
              </Typography>
              <Typography variant="body2" gutterBottom>
                席替え: {interimSeatingPlan ? '生成済み' : '未生成'}
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleGenerateInterimMatches}
              disabled={interimVotes.length === 0 || !settings}
            >
              中間マッチングを生成
            </Button>
            
            {interimMatches.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  マッチング結果
                </Typography>
                
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {interimMatches.map((match) => {
                    const participant1 = participants.find(p => p.id === match.participant1_id);
                    const participant2 = participants.find(p => p.id === match.participant2_id);
                    
                    if (!participant1 || !participant2) return null;
                    
                    return (
                      <Box key={match.id} sx={{ width: { xs: '100%', sm: '45%', md: '30%' } }}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              テーブル {match.table_number}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                {participant1.name} (#{participant1.participant_number})
                              </Typography>
                              <Chip 
                                label={participant1.gender === 'male' ? '男性' : '女性'} 
                                size="small" 
                                color={participant1.gender === 'male' ? 'primary' : 'secondary'}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                {participant2.name} (#{participant2.participant_number})
                              </Typography>
                              <Chip 
                                label={participant2.gender === 'male' ? '男性' : '女性'} 
                                size="small" 
                                color={participant2.gender === 'male' ? 'primary' : 'secondary'}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Box>
            <Typography variant="h6" gutterBottom>
              最終マッチング
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                投票数: {finalVotes.length}
              </Typography>
              <Typography variant="body2" gutterBottom>
                マッチング数: {finalMatches.length}
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="secondary"
              onClick={handleGenerateFinalMatches}
              disabled={finalVotes.length === 0 || !settings}
            >
              最終マッチングを生成
            </Button>
            
            {finalMatches.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  マッチング結果
                </Typography>
                
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {finalMatches.map((match) => {
                    const participant1 = participants.find(p => p.id === match.participant1_id);
                    const participant2 = participants.find(p => p.id === match.participant2_id);
                    
                    if (!participant1 || !participant2) return null;
                    
                    return (
                      <Box key={match.id} sx={{ width: { xs: '100%', sm: '45%', md: '30%' } }}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                {participant1.name} (#{participant1.participant_number})
                              </Typography>
                              <Chip 
                                label={participant1.gender === 'male' ? '男性' : '女性'} 
                                size="small" 
                                color={participant1.gender === 'male' ? 'primary' : 'secondary'}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                {participant2.name} (#{participant2.participant_number})
                              </Typography>
                              <Chip 
                                label={participant2.gender === 'male' ? '男性' : '女性'} 
                                size="small" 
                                color={participant2.gender === 'male' ? 'primary' : 'secondary'}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
