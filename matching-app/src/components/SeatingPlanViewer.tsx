'use client';

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

interface ParticipantInfo {
  id: string;
  name: string;
  gender: string;
  participant_number?: number;
}

interface SeatingPlanViewerProps {
  seatingPlan: SeatingArrangement;
  participants: ParticipantInfo[];
  currentParticipantId: string;
}

export default function SeatingPlanViewer({
  seatingPlan,
  participants,
  currentParticipantId,
}: SeatingPlanViewerProps) {
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">席替え結果</h3>

      <div className="grid grid-cols-1 gap-4">
        {seatingPlan.seatingArrangement.map(table => {
          // Check if current participant is at this table
          const isCurrentParticipantTable = table.participants.some(
            p => p.participantId === currentParticipantId
          );

          // If we want to highlight the current participant's table
          const tableHighlightClass = isCurrentParticipantTable
            ? 'border-primary-main border-2'
            : 'border';

          return (
            <div
              key={table.tableNumber}
              className={`${tableHighlightClass} rounded-lg overflow-hidden shadow-sm`}
            >
              <div className="bg-primary-main text-black px-4 py-2 font-medium">
                テーブル {table.tableNumber}
                {isCurrentParticipantTable && ' (あなたの席)'}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-2">
                  {table.participants.map(participant => {
                    const participantData = getParticipantById(participant.participantId);
                    const isCurrentParticipant = participant.participantId === currentParticipantId;

                    // Highlight the current participant
                    const highlightClass = isCurrentParticipant
                      ? 'bg-primary-light bg-opacity-20'
                      : '';

                    return (
                      <div
                        key={participant.participantId}
                        className={`flex justify-between items-center p-2 rounded-lg border ${highlightClass}`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              participant.gender === 'male'
                                ? 'bg-primary-main'
                                : 'bg-secondary-main'
                            }`}
                          />
                          <span
                            className={`font-medium ${participant.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}
                          >
                            {participantData && participantData.participant_number}番
                            {isCurrentParticipant && ' (あなた)'}
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
          );
        })}
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
