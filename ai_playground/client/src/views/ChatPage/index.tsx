import { Bubble, Sender } from "@ant-design/x";
import { useState } from "react";
import type { ChatItem } from "./module/types";
import { sleep } from "../../utils";

const ChatPage = () => {
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [inputLoading, setInputLoading] = useState(false);

  return (
    <div>
      {chatList.map((item, index) => (
        <Bubble
          key={index}
          content={item.text}
          placement={item.isUser ? "end" : "start"}
          loading={item.isLoading}
          avatar={item.isUser ? <div>User</div> : <div>GPT</div>}
          typing={true}
        />
      ))}
      <Sender
        loading={inputLoading}
        value={input}
        onChange={(v) => {
          setInput(v);
        }}
        onSubmit={(v) => {
          setInputLoading(true);
          setChatList([
            ...chatList,
            {
              text: v,
              isUser: true,
              createdAt: new Date(),
              isLoading: false,
              id: Date.now().toString(),
            },
          ]);
          setInput("");
          new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          })
            .then(() => {
              setChatList((list) => [
                ...list,
                {
                  text: "很抱歉，请你重试",
                  isUser: false,
                  createdAt: new Date(),
                  isLoading: false,
                  id: Date.now().toString(),
                },
              ]);
              return sleep(2000);
            })
            .then(() => {
              setInputLoading(false);
            });
        }}
      />
    </div>
  );
};

export default ChatPage;
