import { Leaf, Instagram, Youtube } from "lucide-react";
import { XIcon } from "@/components/icons/x-icon";

interface PhoneMockupProps {
  /** モックのサイズ（sm: ヒーロー用, md: スライドショー用） */
  size?: "sm" | "md";
  className?: string;
}

/**
 * iPhone 17風のcosmepikプロフィールモックアップ（Pro Maxよりやや短い）
 */
export function PhoneMockup({ size = "sm", className = "" }: PhoneMockupProps) {
  const isMd = size === "md";
  const widthClass = isMd ? "w-[160px]" : "w-[140px] md:w-[200px] lg:w-[260px]";

  return (
    <div
      className={`relative mx-auto ${widthClass} shrink-0 aspect-[9/19] ${className}`}
    >
      <div className="relative h-full w-full rounded-[26px] md:rounded-[36px] lg:rounded-[42px] border-[4px] md:border-[5px] lg:border-[6px] border-gray-200 bg-gray-100 shadow-xl md:shadow-2xl">
        {/* 内側の黒ベゼル */}
        <div className="absolute inset-[2px] md:inset-[3px] lg:inset-[4px] rounded-[22px] md:rounded-[30px] lg:rounded-[36px] bg-black overflow-hidden">
          {/* 画面エリア */}
          <div className="absolute inset-[2px] md:inset-[2.5px] lg:inset-[3px] rounded-[20px] md:rounded-[28px] lg:rounded-[34px] bg-white overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[6px] md:top-[8px] lg:top-[10px] -translate-x-1/2 w-[44px] md:w-[60px] lg:w-[76px] h-[16px] md:h-[22px] lg:h-[28px] rounded-full bg-black z-10" />
            {/* ステータスバー */}
            <div className="absolute left-0 right-0 top-0 h-[28px] md:h-[36px] lg:h-[44px] flex items-center justify-between px-3 md:px-4 lg:px-5 text-[8px] md:text-[10px] lg:text-xs text-black/80 font-medium">
              <span>08:00</span>
              <div className="flex items-center gap-0.5 md:gap-1">
                <span className="inline-block w-1.5 h-1 md:w-2 md:h-1.5 rounded-sm bg-current opacity-60" />
                <span className="inline-block w-2 h-1 md:w-2.5 md:h-1.5 rounded-sm bg-current opacity-80" />
                <span className="inline-block w-1.5 h-1 md:w-2 md:h-1.5 rounded-sm bg-current opacity-60" />
              </div>
            </div>
            {/* コスメリンクコンテンツ */}
            <div
              className="absolute inset-x-0 top-[28px] md:top-[36px] lg:top-[44px] bottom-0 overflow-y-auto overflow-x-hidden"
              style={{
                background:
                  "linear-gradient(180deg, #e8f8f8 0%, #f5f0f8 100%)",
              }}
            >
              <div
                className={`flex flex-col items-center min-h-full ${
                  isMd
                    ? "px-2 pt-1 pb-2 text-[7px]"
                    : "px-1.5 pt-0.5 pb-1.5 md:px-3 md:pt-2 md:pb-3 lg:px-4 lg:pt-4 lg:pb-5"
                }`}
              >
                <div className={`flex items-center gap-1 mb-1 ${isMd ? "" : "md:mb-2 lg:mb-4"}`}>
                  <Leaf className={`text-primary shrink-0 ${isMd ? "h-2.5 w-2.5" : "h-2 w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3"}`} />
                  <span className={`font-serif tracking-wide text-foreground ${isMd ? "text-[8px]" : "text-[6px] md:text-[9px] lg:text-[10px]"}`}>
                    cosmepik
                  </span>
                </div>

                <div className={`relative ${isMd ? "mb-1" : "mb-0.5 md:mb-1.5 lg:mb-2"}`}>
                  <div className={`rounded-full border-2 border-primary p-0.5 ${isMd ? "h-8 w-8" : "h-6 w-6 md:h-10 md:w-10 lg:h-14 lg:w-14"}`}>
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center">
                      <span className={`font-serif text-primary/50 ${isMd ? "text-xs" : "text-[8px] md:text-sm lg:text-lg"}`}>M</span>
                    </div>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-primary font-medium text-primary-foreground ${isMd ? "h-2.5 w-2.5 text-[5px]" : "h-2.5 w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 text-[4px] md:text-[6px] lg:text-[8px]"}`}>
                    K
                  </div>
                </div>

                <p className={`font-medium text-foreground ${isMd ? "text-[8px]" : "text-[7px] md:text-[10px] lg:text-xs"}`}>
                  @mina_kbeauty
                </p>
                <p className={`mt-0.5 text-muted-foreground ${isMd ? "text-[6px]" : "text-[6px] md:text-[8px] lg:text-[9px]"}`}>
                  韓国コスメ好き
                </p>

                <div className={`flex items-center gap-0.5 md:gap-1.5 ${isMd ? "mt-1.5" : "mt-1 md:mt-2 lg:mt-3"}`}>
                  {[Instagram, XIcon, Youtube].map((Icon, i) => (
                    <div key={i} className={`flex items-center justify-center rounded-full border border-border bg-white shrink-0 ${isMd ? "h-4 w-4" : "h-3 w-3 md:h-5 md:w-5 lg:h-6 lg:w-6"}`}>
                      <Icon className={`text-foreground ${isMd ? "h-2 w-2" : "h-1.5 w-1.5 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3"}`} />
                    </div>
                  ))}
                </div>

                <div className={`flex w-full items-center justify-center rounded-md md:rounded-lg lg:rounded-xl bg-white shadow-sm ${isMd ? "mt-1.5 p-1.5" : "mt-1 md:mt-2 lg:mt-3 p-1 md:p-2 lg:p-2.5"}`}>
                  <div className="flex-1 text-center border-r border-border">
                    <p className={`font-semibold text-foreground ${isMd ? "text-[8px]" : "text-[7px] md:text-[10px] lg:text-xs"}`}>24</p>
                    <p className={`text-muted-foreground ${isMd ? "text-[5px]" : "text-[4px] md:text-[6px] lg:text-[8px]"}`}>アイテム</p>
                  </div>
                  <div className="flex-1 text-center border-r border-border">
                    <p className={`font-semibold text-foreground ${isMd ? "text-[8px]" : "text-[7px] md:text-[10px] lg:text-xs"}`}>1.2K</p>
                    <p className={`text-muted-foreground ${isMd ? "text-[5px]" : "text-[4px] md:text-[6px] lg:text-[8px]"}`}>フォロワー</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className={`font-semibold text-foreground ${isMd ? "text-[8px]" : "text-[7px] md:text-[10px] lg:text-xs"}`}>856</p>
                    <p className={`text-muted-foreground ${isMd ? "text-[5px]" : "text-[4px] md:text-[6px] lg:text-[8px]"}`}>いいね</p>
                  </div>
                </div>

                <div className={`w-full text-left ${isMd ? "mt-1.5" : "mt-1 md:mt-2 lg:mt-3"}`}>
                  <div className={`flex items-center gap-0.5 md:gap-1.5 ${isMd ? "mb-0.5" : "mb-0.5 md:mb-1"}`}>
                    <span className={`flex items-center justify-center rounded bg-primary font-semibold text-primary-foreground shrink-0 ${isMd ? "h-2.5 w-4 text-[5px]" : "h-2 w-4 md:h-3 md:w-5 lg:h-3.5 lg:w-6 text-[4px] md:text-[6px] lg:text-[7px]"}`}>
                      AM
                    </span>
                    <span className={`font-semibold text-foreground ${isMd ? "text-[6px]" : "text-[6px] md:text-[8px] lg:text-[9px]"}`}>
                      朝のルーティン
                    </span>
                  </div>
                  <div className={`rounded-md md:rounded-lg lg:rounded-xl bg-white shadow-sm ${isMd ? "p-1" : "p-1 md:p-1.5 lg:p-2"}`}>
                    <div className={`flex items-center gap-0.5 md:gap-1.5 lg:gap-2 ${isMd ? "gap-1" : ""}`}>
                      <div className={`flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary shrink-0 ${isMd ? "h-2.5 w-2.5 text-[5px]" : "h-2 w-2 md:h-3 md:w-3 lg:h-4 lg:w-4 text-[4px] md:text-[6px] lg:text-[7px]"}`}>
                        1
                      </div>
                      <div className={`rounded md:rounded-md lg:rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shrink-0 ${isMd ? "h-4 w-4" : "h-3 w-3 md:h-5 md:w-5 lg:h-6 lg:w-6"}`}>
                        <div className={`rounded-sm bg-primary/30 ${isMd ? "h-2.5 w-1.5" : "h-2 w-1 md:h-3 md:w-2 lg:h-4 lg:w-2.5"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-primary tracking-wide ${isMd ? "text-[5px]" : "text-[4px] md:text-[6px] lg:text-[7px]"}`}>INNISFREE</p>
                        <p className={`font-medium text-foreground truncate ${isMd ? "text-[6px]" : "text-[5px] md:text-[7px] lg:text-[8px]"}`}>グリーンティー クレンザー</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
