'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stack,
  Card,
  CardContent,
  CardActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { Participant } from '@/lib/db/supabase';
import { generateQRCodeUrl } from '@/lib/utils/token';

interface QRCodeGeneratorProps {
  participants: Participant[];
  baseUrl: string;
  onGenerateAll: () => Promise<void>;
  isGenerating: boolean;
}

export default function QRCodeGenerator({ 
  participants, 
  baseUrl,
  onGenerateAll,
  isGenerating
}: QRCodeGeneratorProps) {
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>(participants);
  
  useEffect(() => {
    if (searchTerm) {
      setFilteredParticipants(
        participants.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.participant_number.toString().includes(searchTerm)
        )
      );
    } else {
      setFilteredParticipants(participants);
    }
  }, [searchTerm, participants]);
  
  const handleGenerateAll = async () => {
    try {
      setError(null);
      await onGenerateAll();
    } catch (error) {
      console.error('Error generating QR codes:', error);
      setError('QRコードの生成中にエラーが発生しました。もう一度お試しください。');
    }
  };
  
  const handlePrintAll = () => {
    window.print();
  };
  
  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        QRコード生成
      </Typography>
      
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="参加者を検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="名前または参加者番号"
            sx={{ minWidth: 300 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handlePrintAll}
              disabled={participants.length === 0}
            >
              すべて印刷
            </Button>
            <Button
              variant="contained"
              onClick={handleGenerateAll}
              disabled={isGenerating || participants.length === 0}
            >
              {isGenerating ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  生成中...
                </>
              ) : 'すべてのQRコードを生成'}
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error">{error}</Alert>
        )}
        
        {filteredParticipants.length === 0 ? (
          <Alert severity="info">
            {participants.length === 0 
              ? '参加者が登録されていません。参加者を追加してください。' 
              : '検索条件に一致する参加者が見つかりません。'}
          </Alert>
        ) : (
          <Box className="qr-code-grid">
            <Stack direction="row" flexWrap="wrap" gap={3}>
              {filteredParticipants.map((participant) => (
                <Box key={participant.id} sx={{ width: { xs: '100%', sm: '45%', md: '30%', lg: '22%' } }}>
                  <Card className="qr-code-card">
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {participant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        参加者番号: {participant.participant_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        性別: {participant.gender === 'male' ? '男性' : '女性'}
                      </Typography>
                      
                      {participant.access_token ? (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <img 
                            src={generateQRCodeUrl(participant.access_token, baseUrl)}
                            alt={`QR Code for ${participant.name}`}
                            style={{ width: '100%', maxWidth: 200, height: 'auto' }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ mt: 2, textAlign: 'center', p: 3, bgcolor: '#f5f5f5' }}>
                          <Typography color="text.secondary">
                            QRコードが生成されていません
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {participant.access_token 
                          ? `トークン: ${participant.access_token.substring(0, 8)}...` 
                          : 'トークンなし'}
                      </Typography>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .qr-code-grid, .qr-code-grid * {
            visibility: visible;
          }
          .qr-code-grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .qr-code-card {
            page-break-inside: avoid;
            margin: 10mm;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </Paper>
  );
}
