import useAuth from "@/hooks/useAuth";
import supabase, { Database } from "@/lib/supabase";
import {
  addSupabaseData,
  fetchDatabase,
  TABLE_NAME,
} from "@/lib/supabaseFunctions";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ChatApp = () => {
  const [inputText, setInputText] = useState(""); // 入力テキスト
  const [messageText, setMessageText] = useState<Database[]>([]); // メッセージ
  const { session: isLogin, profileFromGithub } = useAuth();
  const router = useRouter();

  if (!isLogin) router.push("/");

  const fetchRealtimeData = () => {
    try {
      supabase
        .channel("table_postgres_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: TABLE_NAME,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const { createdAt, id, message, avatarUrl, nickName } =
                payload.new;
              setMessageText((messageText) => [
                ...messageText,
                { createdAt, id, message, avatarUrl, nickName },
              ]);
            }
          }
        )
        .subscribe();

      return () => supabase.channel("table_postgres_changes").unsubscribe();
    } catch (error) {
      console.error(error);
    }
  };
  // 初回のみ全データフェッチとリアルタイムリスナー登録
  useEffect(() => {
    (async () => {
      const allMessage = await fetchDatabase();
      setMessageText(allMessage as Database[]); // '{ [x: string]: any; }[] | null'
    })();
    fetchRealtimeData();
  }, []);
  // 入力したメッセージ
  const onChangeInputText = (event: React.ChangeEvent<HTMLInputElement>) =>
    setInputText(() => event.target.value);
  // メッセージの送信
  const onSubmitNewMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputText === "") return;
    addSupabaseData({ message: inputText, ...profileFromGithub }); // DBに追加
    setInputText("");
  };

  return (
    <div>
      {messageText.map((item) => (
        // 自分のチャットの時は右側に表示
        <div
          key={item.id}
          data-my-chat={item.nickName === profileFromGithub.nickName}
        >
          <div>
            <time>{dateToString(item.createdAt, "MM/DD HH:mm")}</time>
            <a
              href={`https://github.com/${item.nickName}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt="アイコン"
                  width={80}
                  height={80}
                />
              ) : (
                <Image
                  src="/noimage.png"
                  alt="no image"
                  width={80}
                  height={80}
                />
              )}
              <p>{item.nickName ? item.nickName : "名無し"}</p>
            </a>
          </div>
          <div>
            <p>{item.message}</p>
          </div>
        </div>
      ))}

      <form onSubmit={onSubmitNewMessage}>
        <input
          type="text"
          name="message"
          value={inputText}
          onChange={onChangeInputText}
          aria-label="新規メッセージを入力"
        />
        <button type="submit" disabled={inputText === ""}>
          送信
        </button>
      </form>
    </div>
  );
};
export default ChatApp;
