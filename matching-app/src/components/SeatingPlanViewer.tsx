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
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-300 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <p className="text-gray-500 font-serif">座席レイアウトがありません</p>
      </div>
    );
  }

  const getParticipantById = (id: string) => {
    return participants.find(p => p.id === id);
  };

  // Count male and female participants
  const genderCounts = seatingPlan.seatingArrangement.reduce(
    (counts, table) => {
      table.participants.forEach(p => {
        if (p.gender === 'male') counts.male++;
        else if (p.gender === 'female') counts.female++;
      });
      return counts;
    },
    { male: 0, female: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5">
        {seatingPlan.seatingArrangement.map(table => {
          // Check if current participant is at this table
          const isCurrentParticipantTable = table.participants.some(
            p => p.participantId === currentParticipantId
          );

          // Sort participants so that males and females alternate if possible
          const sortedParticipants = [...table.participants].sort((a, b) => {
            // First, prioritize gender alternation
            if (a.gender !== b.gender) return a.gender === 'male' ? -1 : 1;
            // If same gender, keep original order
            return 0;
          });

          return (
            <div
              key={table.tableNumber}
              className={`rounded-xl overflow-hidden shadow-card transition-all duration-200 ${
                isCurrentParticipantTable
                  ? 'border-0 border-accent-gold ring-2 ring-accent-gold ring-opacity-20 transform -translate-y-1'
                  : 'border border-gray-100 hover:-translate-y-1 hover:shadow-md'
              }`}
            >
              <div
                className={`px-4 py-3 font-medium flex items-center justify-between ${
                  isCurrentParticipantTable
                    ? 'bg-gradient-to-r from-accent-gold to-primary-light text-red-400'
                    : 'bg-primary-light bg-opacity-10 text-primary-dark'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm ${
                      isCurrentParticipantTable
                        ? 'bg-white bg-opacity-20 text-red-400'
                        : 'bg-primary-main bg-opacity-10 text-primary-dark'
                    }`}
                  >
                    {table.tableNumber}
                  </div>
                  <span>テーブル {table.tableNumber}</span>
                </div>
                {isCurrentParticipantTable && (
                  <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
                    あなたの席
                  </div>
                )}
              </div>

              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 gap-3">
                  {sortedParticipants.map(participant => {
                    const participantData = getParticipantById(participant.participantId);
                    const isCurrentParticipant = participant.participantId === currentParticipantId;
                    const isMale = participant.gender === 'male';

                    // Determine styles based on gender and current participant
                    const genderColor = isMale ? 'blue-400' : 'pink-400';
                    const genderLabel = isMale ? '男性' : '女性';

                    return (
                      <div
                        key={participant.participantId}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          isCurrentParticipant
                            ? `bg-${genderColor} bg-opacity-10 border border-${genderColor} border-opacity-20`
                            : 'bg-gray-50 border border-gray-100'
                        } transition-all duration-200 hover:shadow-sm`}
                      >
                        <div className="flex items-center">
                          <div>
                            <span className={`font-medium text-text-primary text-xs`}>
                              {participantData && participantData.participant_number}番:{' '}
                              {participantData?.name}
                            </span>
                            {isCurrentParticipant && (
                              <span className="ml-2 text-xs bg-accent-gold bg-opacity-20 text-accent-gold px-2 py-0.5 rounded-full">
                                あなた
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${genderColor} bg-opacity-10 text-${genderColor}`}
                        >
                          {genderLabel}
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

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h4 className="font-medium mb-3 text-primary-dark flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-accent-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          席替え情報
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border border-gray-100 text-center">
            <p className="text-xs text-text-secondary mb-1">テーブル数</p>
            <p className="text-xl font-serif text-primary-dark">
              {seatingPlan.seatingArrangement.length}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 text-center">
            <p className="text-xs text-text-secondary mb-1">参加者数</p>
            <p className="text-xl font-serif text-primary-dark">
              {seatingPlan.seatingArrangement.reduce(
                (total, table) => total + table.participants.length,
                0
              )}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 text-center">
            <p className="text-xs text-text-secondary mb-1">男女比</p>
            <p className="text-xl font-serif text-primary-dark">
              {genderCounts.male}:{genderCounts.female}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
