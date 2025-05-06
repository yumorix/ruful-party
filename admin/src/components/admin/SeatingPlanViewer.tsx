'use client';

import { Participant } from '@/lib/db/supabase';

interface SeatingArrangementParticipant {
  participantId: string;
  name: string;
  gender: string;
}

interface SeatingArrangementTable {
  tableNumber: number;
  participants: SeatingArrangementParticipant[];
}

interface SeatingArrangement {
  seatingArrangement: SeatingArrangementTable[];
}

interface SeatingPlanViewerProps {
  seatingPlan: SeatingArrangement;
  participants: Participant[];
}

export default function SeatingPlanViewer({ seatingPlan, participants }: SeatingPlanViewerProps) {
  if (!seatingPlan || !seatingPlan.seatingArrangement) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">座席レイアウトがありません。</p>
      </div>
    );
  }

  const getParticipantById = (id: string) => {
    return participants.find(p => p.id === id);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">AIによる席替え結果</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seatingPlan.seatingArrangement.map(table => (
          <div key={table.tableNumber} className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-primary-main text-black px-4 py-2 font-medium">
              テーブル {table.tableNumber}
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {table.participants.map(participant => {
                  const participantData = getParticipantById(participant.participantId);

                  return (
                    <div
                      key={participant.participantId}
                      className="flex justify-between items-center p-2 rounded-lg border"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            participant.gender === 'male' ? 'bg-primary-main' : 'bg-secondary-main'
                          }`}
                        />
                        <span
                          className={`font-medium ${participant.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}
                        >
                          {participantData && participantData.participant_number}番
                          {participantData && ` (${participant.name})`}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          participant.gender === 'male'
                            ? 'bg-primary-light text-primary-dark text-blue-400'
                            : 'bg-secondary-light text-secondary-dark text-pink-400'
                        }`}
                      >
                        {participant.gender === 'male' ? '男性' : '女性'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">席替え情報</h4>
        <div className="text-sm text-gray-600">
          <p>テーブル数: {seatingPlan.seatingArrangement.length}</p>
          <p>
            参加者数:{' '}
            {seatingPlan.seatingArrangement.reduce(
              (total, table) => total + table.participants.length,
              0
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
