'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Shuffle as ShuffleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { Party } from '@/lib/db/supabase';

interface PartyListProps {
  parties: Party[];
  onDelete: (id: string) => Promise<void>;
}

export default function PartyList({ parties, onDelete }: PartyListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (party: Party) => {
    setPartyToDelete(party);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!partyToDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(partyToDelete.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting party:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPartyToDelete(null);
  };

  const getStatusChip = (status: Party['status']) => {
    switch (status) {
      case 'preparing':
        return <Chip label="準備中" color="info" size="small" />;
      case 'active':
        return <Chip label="開催中" color="success" size="small" />;
      case 'closed':
        return <Chip label="終了" color="default" size="small" />;
      default:
        return null;
    }
  };

  const getModeChip = (mode: Party['current_mode']) => {
    switch (mode) {
      case 'interim':
        return <Chip label="中間投票" color="primary" size="small" />;
      case 'final':
        return <Chip label="最終投票" color="secondary" size="small" />;
      case 'closed':
        return <Chip label="クローズ" color="default" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          パーティ一覧
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/parties/new"
        >
          新規パーティ
        </Button>
      </Box>

      {parties.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              パーティがまだ登録されていません。「新規パーティ」ボタンから作成してください。
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {parties.map((party) => (
            <Card key={party.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {party.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {format(new Date(party.date), 'yyyy年MM月dd日(E) HH:mm', { locale: ja })}
                    </Typography>
                    <Typography variant="body2">
                      {party.location}
                    </Typography>
                    <Typography variant="body2">
                      定員: {party.capacity}名
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {getStatusChip(party.status)}
                    {getModeChip(party.current_mode)}
                  </Stack>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="参加者管理">
                  <IconButton
                    component={Link}
                    href={`/admin/parties/${party.id}/participants`}
                  >
                    <PeopleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="設定">
                  <IconButton
                    component={Link}
                    href={`/admin/parties/${party.id}/settings`}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="マッチング">
                  <IconButton
                    component={Link}
                    href={`/admin/parties/${party.id}/matching`}
                  >
                    <ShuffleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="編集">
                  <IconButton
                    component={Link}
                    href={`/admin/parties/${party.id}`}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="削除">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(party)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>パーティを削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {partyToDelete && `「${partyToDelete.name}」を削除します。この操作は元に戻せません。`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            キャンセル
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting}>
            {isDeleting ? '削除中...' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
