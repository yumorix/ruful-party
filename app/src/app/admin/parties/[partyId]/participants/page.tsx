import { notFound, redirect } from 'next/navigation';
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import Link from 'next/link';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, QrCode as QrCodeIcon } from '@mui/icons-material';
import { getParty, getParticipants, createParticipant, updateParticipant, deleteParticipant } from '@/lib/db/queries';
import { ParticipantFormData } from '@/lib/utils/validation';
import { generateAccessToken } from '@/lib/utils/token';
import ParticipantForm from '@/components/admin/ParticipantForm';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';

interface ParticipantsPageProps {
  params: {
    partyId: string;
  };
}

export default async function ParticipantsPage({ params }: ParticipantsPageProps) {
  const { partyId } = params;
  
  const party = await getParty(partyId);
  
  if (!party) {
    notFound();
  }
  
  const participants = await getParticipants(partyId);
  
  // Group participants by gender
  const maleParticipants = participants.filter(p => p.gender === 'male');
  const femaleParticipants = participants.filter(p => p.gender === 'female');
  
  async function handleAddParticipant(data: ParticipantFormData) {
    'use server';
    
    await createParticipant({
      ...data,
      party_id: partyId,
      access_token: generateAccessToken(partyId, data.name)
    });
    
    redirect(`/admin/parties/${partyId}/participants`);
  }
  
  async function handleGenerateAllQRCodes() {
    'use server';
    
    // Generate access tokens for participants who don't have one
    for (const participant of participants) {
      if (!participant.access_token) {
        await updateParticipant(participant.id, {
          access_token: generateAccessToken(partyId, participant.name)
        });
      }
    }
    
    redirect(`/admin/parties/${partyId}/participants`);
  }
  
  async function handleDeleteParticipant(id: string) {
    'use server';
    
    await deleteParticipant(id);
    redirect(`/admin/parties/${partyId}/participants`);
  }
  
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/admin/parties">パーティ一覧</Link>
        <Link href={`/admin/parties/${partyId}`}>{party.name}</Link>
        <Typography color="text.primary">参加者管理</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          参加者管理
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          href={`/admin/parties/${partyId}/participants/new`}
        >
          参加者を追加
        </Button>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={0} aria-label="participant tabs">
          <Tab label={`参加者一覧 (${participants.length})`} />
          <Tab label="QRコード生成" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              男性参加者 ({maleParticipants.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>参加者番号</TableCell>
                    <TableCell>名前</TableCell>
                    <TableCell>QRコード</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maleParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        男性参加者がいません
                      </TableCell>
                    </TableRow>
                  ) : (
                    maleParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.participant_number}</TableCell>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>
                          {participant.access_token ? (
                            <Typography variant="body2" color="success.main">
                              生成済み
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="error">
                              未生成
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            component={Link}
                            href={`/admin/parties/${partyId}/participants/${participant.id}/edit`}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="error"
                            size="small"
                            onClick={() => handleDeleteParticipant(participant.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom>
              女性参加者 ({femaleParticipants.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>参加者番号</TableCell>
                    <TableCell>名前</TableCell>
                    <TableCell>QRコード</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {femaleParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        女性参加者がいません
                      </TableCell>
                    </TableRow>
                  ) : (
                    femaleParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.participant_number}</TableCell>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>
                          {participant.access_token ? (
                            <Typography variant="body2" color="success.main">
                              生成済み
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="error">
                              未生成
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            component={Link}
                            href={`/admin/parties/${partyId}/participants/${participant.id}/edit`}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="error"
                            size="small"
                            onClick={() => handleDeleteParticipant(participant.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Paper>
      
      <Paper>
        <Box sx={{ p: 3 }}>
          <QRCodeGenerator 
            participants={participants}
            baseUrl={process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}
            onGenerateAll={handleGenerateAllQRCodes}
            isGenerating={false}
          />
        </Box>
      </Paper>
    </Box>
  );
}
