import React, { useState } from "react";

function VideoScript() {

    const [showTranscript, setShowTranscript] = useState(true); // transcript 보이기/숨기기
    return (
        <div className="w-300 flex flex-col gap-2 rounded-lg bg-[var(--color-white)] p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold w-full">📄 Transcript</h2>
                <button
                    onClick={() => setShowTranscript(prev => !prev)}
                    className="text-[var(--color-main)] font-semibold w-full text-right"
                >
                    {showTranscript ? "숨기기" : "보이기"}
                </button>
            </div>

            <div className="flex w-full h-90 rounded-lg p-2 flex-col gap-2 bg-[var(--color-sub-2)] overflow-hidden overflow-y-auto">

                {showTranscript && (
                    Array(9).fill(null).map((_, idx) => (
                        <div key={idx} className="w-full">
                            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default VideoScript;
