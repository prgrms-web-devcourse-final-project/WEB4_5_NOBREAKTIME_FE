import React, { useState } from "react";

interface Props {
    fontSize: number; // 폰트 크기
}

function VideoTab({ fontSize }: Props) {
    const [selectedTab, setSelectedTab] = useState<string>("overview");

    return (
        <div className="flex flex-row w-full h-60 bg-[var(--color-white)] rounded-lg">
            {/* 좌측 탭 목록 */}
            <div className="flex justify-center items-center w-50 h-full p-4">
                <ul className="w-full h-full flex flex-col border-r-2 border-[var(--color-main)] px-2">
                    {["overview", "단어", "표현"].map((tab) => (
                        <li
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`flex-1 text-lg font-bold cursor-pointer flex items-center pl-2 ${selectedTab === tab
                                ? "border-b-2 border-[var(--color-main)] text-[var(--color-main)]" : "text-[var(--color-sub-1)]"
                                }`}
                        >
                            {tab}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 우측 탭 내용 */}
            <div className="w-full h-full p-4">
                {selectedTab === "overview" && (
                    <div className="w-full h-full" style={{ fontSize: `${fontSize}px` }}>overview</div>
                )}
                {selectedTab === "단어" && (
                    <div className="w-full h-full" style={{ fontSize: `${fontSize}px` }}>단어</div>
                )}
                {selectedTab === "표현" && (
                    <div className="w-full h-full" style={{ fontSize: `${fontSize}px` }}>표현</div>
                )}
            </div>
        </div>
    );
}

export default VideoTab;
