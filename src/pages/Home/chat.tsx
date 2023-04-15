import { Key, memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { ReactComponent as AddIcon } from '@/icons/add.svg';
import { ReactComponent as BotIcon } from '@/icons/bot.svg';
import { ReactComponent as BrainIcon } from '@/icons/brain.svg';
import { ReactComponent as CopyIcon } from '@/icons/copy.svg';
import { ReactComponent as DeleteIcon } from '@/icons/delete.svg';
import { ReactComponent as DownloadIcon } from '@/icons/download.svg';
import { ReactComponent as MaxIcon } from '@/icons/max.svg';
import { ReactComponent as MinIcon } from '@/icons/min.svg';
import { ReactComponent as ReturnIcon } from '@/icons/return.svg';
import { ReactComponent as SendWhiteIcon } from '@/icons/send-white.svg';
import { ReactComponent as ExportIcon } from '@/icons/share.svg';
import { ReactComponent as LoadingIcon } from '@/icons/three-dots.svg';
import { ReactComponent as UserIcon } from '@/icons/user.svg';

import {
  BOT_HELLO,
  createMessage,
  Message,
  ROLES,
  SubmitKey,
  useAccessStore,
  useChatStore,
} from '@/store';

import {
  autoGrowTextArea,
  copyToClipboard,
  downloadAs,
  isMobileScreen,
  selectOrCopy,
} from '@/utils';

import dynamic from 'next/dynamic';

import Locale from '@/clocales';
import { ControllerPool } from '@/requests';
import { Prompt, usePromptStore } from '@/store/prompt';

import { IconButton } from './button';
import chatStyle from './chat.module.scss';
import styles from './home.module.scss';

import { Input, Modal, showModal } from './ui-lib';

const Markdown = dynamic(async () => memo((await import('./markdown')).Markdown), {
  loading: () => <LoadingIcon />,
});

export function Avatar(props: { role: Message['role'] }) {
  // const config = useChatStore((state: { config: any; }) => state.config);

  if (props.role !== 'user') {
    return <BotIcon className={styles['user-avtar']} />;
  }

  return (
    <UserIcon className={styles['user-avtar']} />
    // <div className={styles['user-avtar']}>
    //   <Emoji unified={config.avatar} size={18} getEmojiUrl={getEmojiUrl} />
    // </div>
  );
}

function exportMessages(messages: Message[], topic: string) {
  const mdText =
    `# ${topic}\n\n` +
    messages
      .map((m) => {
        return m.role === 'user'
          ? `## ${Locale.Export.MessageFromYou}:\n${m.content}`
          : `## ${Locale.Export.MessageFromChatGPT}:\n${m.content.trim()}`;
      })
      .join('\n\n');
  const filename = `${topic}.md`;

  showModal({
    title: Locale.Export.Title,
    children: (
      <div className="markdown-body">
        <pre className={styles['export-content']}>{mdText}</pre>
      </div>
    ),
    actions: [
      <IconButton
        key="copy"
        icon={<CopyIcon />}
        bordered
        text={Locale.Export.Copy}
        onClick={() => copyToClipboard(mdText)}
      />,
      <IconButton
        key="download"
        icon={<DownloadIcon />}
        bordered
        text={Locale.Export.Download}
        onClick={() => downloadAs(mdText, filename)}
      />,
    ],
  });
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.context;

  const addContextPrompt = (prompt: Message) => {
    chatStore.updateCurrentSession((session: { context: any[] }) => {
      session.context.push(prompt);
    });
  };

  const removeContextPrompt = (i: number) => {
    chatStore.updateCurrentSession((session: { context: any[] }) => {
      session.context.splice(i, 1);
    });
  };

  const updateContextPrompt = (i: number, prompt: Message) => {
    chatStore.updateCurrentSession((session: { context: any[] }) => {
      session.context[i] = prompt;
    });
  };

  return (
    <div className={chatStyle['prompt-toast']} key="prompt-toast">
      {props.showToast && (
        <div
          className={chatStyle['prompt-toast-inner'] + ' clickable'}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={chatStyle['prompt-toast-content']}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <div className="modal-mask">
          <Modal
            title={Locale.Context.Edit}
            onClose={() => props.setShowModal(false)}
            actions={[
              <IconButton
                key="reset"
                icon={<CopyIcon />}
                bordered
                text={Locale.Memory.Reset}
                onClick={() => confirm(Locale.Memory.ResetConfirm) && chatStore.resetSession()}
              />,
              <IconButton
                key="copy"
                icon={<CopyIcon />}
                bordered
                text={Locale.Memory.Copy}
                onClick={() => copyToClipboard(session.memoryPrompt)}
              />,
            ]}
          >
            <>
              <div className={chatStyle['context-prompt']}>
                {context.map(
                  (
                    c: {
                      role: string | number | readonly string[] | undefined;
                      content: string | number | readonly string[] | undefined;
                    },
                    i: Key | null | undefined,
                  ) => (
                    <div className={chatStyle['context-prompt-row']} key={i}>
                      <select
                        value={c.role}
                        className={chatStyle['context-role']}
                        onChange={(e) =>
                          updateContextPrompt(i as number, {
                            ...c,
                            role: e.target.value as any,
                          })
                        }
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={c.content}
                        type="text"
                        className={chatStyle['context-content']}
                        rows={1}
                        onInput={(e) =>
                          updateContextPrompt(i as number, {
                            ...c,
                            content: e.currentTarget.value as any,
                          })
                        }
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        className={chatStyle['context-delete-button']}
                        onClick={() => removeContextPrompt(i as number)}
                        bordered
                      />
                    </div>
                  ),
                )}

                <div className={chatStyle['context-prompt-row']}>
                  <IconButton
                    icon={<AddIcon />}
                    text={Locale.Context.Add}
                    bordered
                    className={chatStyle['context-prompt-button']}
                    onClick={() =>
                      addContextPrompt({
                        role: 'system',
                        content: '',
                        date: '',
                      })
                    }
                  />
                </div>
              </div>
              <div className={chatStyle['memory-prompt']}>
                <div className={chatStyle['memory-prompt-title']}>
                  <span>
                    {Locale.Memory.Title} ({session.lastSummarizeIndex} of {session.messages.length}
                    )
                  </span>

                  <label className={chatStyle['memory-prompt-action']}>
                    {Locale.Memory.Send}
                    <input
                      type="checkbox"
                      checked={session.sendMemory}
                      onChange={() =>
                        chatStore.updateCurrentSession(
                          (session: { sendMemory: boolean }) =>
                            (session.sendMemory = !session.sendMemory),
                        )
                      }
                    ></input>
                  </label>
                </div>
                <div className={chatStyle['memory-prompt-content']}>
                  {session.memoryPrompt || Locale.Memory.EmptyContent}
                </div>
              </div>
            </>
          </Modal>
        </div>
      )}
    </div>
  );
}

function useSubmitHandler() {
  const config = useChatStore((state: { config: any }) => state.config);
  const submitKey = config.submitKey;

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return false;
    if (e.key === 'Enter' && e.nativeEvent.isComposing) return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export function PromptHints(props: {
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}) {
  if (props.prompts.length === 0) return null;

  return (
    <div className={styles['prompt-hints']}>
      {props.prompts.map((prompt, i) => (
        <div
          className={styles['prompt-hint']}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
        >
          <div className={styles['hint-title']}>{prompt.title}</div>
          <div className={styles['hint-content']}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // auto scroll
  useLayoutEffect(() => {
    const dom = scrollRef.current;
    if (dom && autoScroll) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
  };
}

export function Chat(props: { showSideBar?: () => void; sideBarShowing?: boolean }) {
  type RenderMessage = Message & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore(
    (state: { currentSession: () => any; currentSessionIndex: any }) => [
      state.currentSession(),
      state.currentSessionIndex,
    ],
  );
  const fontSize = useChatStore((state: { config: { fontSize: any } }) => state.config.fontSize);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState('');
  const [beforeInput, setBeforeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(false);

  const onChatBodyScroll = (e: HTMLElement) => {
    setAutoScroll(false);
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 20;
    setHitBottom(isTouchBottom);
  };

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<Prompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      setPromptHints(promptStore.search(text));
    },
    100,
    { leading: true, trailing: true },
  );

  const onPromptSelect = (prompt: Prompt) => {
    setUserInput(prompt.content);
    setPromptHints([]);
    inputRef.current?.focus();
  };

  const scrollInput = () => {
    const dom = inputRef.current;
    if (!dom) return;
    const paddingBottomNum: number = parseInt(window.getComputedStyle(dom).paddingBottom, 10);
    dom.scrollTop = dom.scrollHeight - dom.offsetHeight + paddingBottomNum;
  };

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(5, Math.max(2 + Number(!isMobileScreen()), rows));
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    scrollInput();
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (!chatStore.config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith('/')) {
        let searchText = text.slice(1);
        onSearch(searchText);
      }
    }
  };

  // submit user input
  const onUserSubmit = () => {
    if (userInput.length <= 0) return;
    setIsLoading(true);
    chatStore.onUserInput(userInput).then(() => setIsLoading(false));
    setBeforeInput(userInput);
    setUserInput('');
    setPromptHints([]);
    if (!isMobileScreen()) inputRef.current?.focus();
    setAutoScroll(true);
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ControllerPool.stop(sessionIndex, messageId);
  };

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput
    if (e.key === 'ArrowUp' && userInput.length <= 0) {
      setUserInput(beforeInput);
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e)) {
      onUserSubmit();
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: Message) => {
    // auto fill user input
    if (message.role === 'user') {
      setUserInput(message.content);
    }

    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      e.preventDefault();
    }
  };

  const onResend = (botIndex: number) => {
    // find last user input message and resend
    for (let i = botIndex; i >= 0; i -= 1) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (messages[i].role === 'user') {
        setIsLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        chatStore.onUserInput(messages[i].content).then(() => setIsLoading(false));
        chatStore.updateCurrentSession((session: { messages: any[] }) =>
          session.messages.splice(i, 2),
        );
        inputRef.current?.focus();
        return;
      }
    }
  };

  const config = useChatStore((state: { config: any }) => state.config);

  const context: RenderMessage[] = session.context.slice();

  const accessStore = useAccessStore();

  if (context.length === 0 && session.messages.at(0)?.content !== BOT_HELLO.content) {
    const copiedHello = Object.assign({}, BOT_HELLO);
    if (!accessStore.isAuthorized()) {
      copiedHello.content = Locale.Error.Unauthorized;
    }
    context.push(copiedHello);
  }

  // preview messages
  const messages = context
    .concat(session.messages as RenderMessage[])
    .concat(
      isLoading
        ? [
            {
              ...createMessage({
                role: 'assistant',
                content: '……',
              }),
              preview: true,
            },
          ]
        : [],
    )
    .concat(
      userInput.length > 0 && config.sendPreviewBubble
        ? [
            {
              ...createMessage({
                role: 'user',
                content: userInput,
              }),
              preview: true,
            },
          ]
        : [],
    );

  const [showPromptModal, setShowPromptModal] = useState(false);

  // Auto focus
  useEffect(() => {
    if (props.sideBarShowing && isMobileScreen()) return;
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.chat} key={session.id}>
      <div className={styles['window-header']}>
        <div className={styles['window-header-title']}>
          <div
            className={`${styles['window-header-main-title']} ${styles['chat-body-title']}`}
            onClickCapture={() => {
              const newTopic = prompt(Locale.Chat.Rename, session.topic);
              if (newTopic && newTopic !== session.topic) {
                chatStore.updateCurrentSession(
                  (session: { topic: string }) => (session.topic = newTopic!),
                );
              }
            }}
          >
            {session.topic}
          </div>
          <div className={styles['window-header-sub-title']}>
            {Locale.Chat.SubTitle(session.messages.length)}
          </div>
        </div>
        <div className={styles['window-actions']}>
          <div className={styles['window-action-button'] + ' ' + styles.mobile}>
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={Locale.Chat.Actions.ChatList}
              onClick={props?.showSideBar}
            />
          </div>
          <div className={styles['window-action-button']}>
            <IconButton
              icon={<BrainIcon />}
              bordered
              title={Locale.Chat.Actions.CompressedHistory}
              onClick={() => {
                setShowPromptModal(true);
              }}
            />
          </div>
          <div className={styles['window-action-button']}>
            <IconButton
              icon={<ExportIcon />}
              bordered
              title={Locale.Chat.Actions.Export}
              onClick={() => {
                exportMessages(
                  session.messages.filter((msg: { isError: any }) => !msg.isError),
                  session.topic,
                );
              }}
            />
          </div>
          {!isMobileScreen() && (
            <div className={styles['window-action-button']}>
              <IconButton
                icon={chatStore.config.tightBorder ? <MinIcon /> : <MaxIcon />}
                bordered
                onClick={() => {
                  chatStore.updateConfig(
                    (config: { tightBorder: boolean }) =>
                      (config.tightBorder = !config.tightBorder),
                  );
                }}
              />
            </div>
          )}
        </div>

        <PromptToast
          showToast={!hitBottom}
          showModal={showPromptModal}
          setShowModal={setShowPromptModal}
        />
      </div>

      <div
        className={styles['chat-body']}
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {messages.map((message, i) => {
          const isUser = message.role === 'user';

          return (
            <div key={i} className={isUser ? styles['chat-message-user'] : styles['chat-message']}>
              <div className={styles['chat-message-container']}>
                {!isUser && (
                  <div className={styles['chat-message-avatar']}>
                    <Avatar role={message.role} />
                  </div>
                )}

                {(message.preview || message.streaming) && (
                  <div className={styles['chat-message-status']}>{Locale.Chat.Typing}</div>
                )}
                <div className={styles['chat-message-item']}>
                  {!isUser && !(message.preview || message.content.length === 0) && (
                    <div className={styles['chat-message-top-actions']}>
                      {message.streaming ? (
                        <div
                          className={styles['chat-message-top-action']}
                          onClick={() => onUserStop(message.id ?? i)}
                        >
                          {Locale.Chat.Actions.Stop}
                        </div>
                      ) : (
                        <div
                          className={styles['chat-message-top-action']}
                          onClick={() => onResend(i)}
                        >
                          {Locale.Chat.Actions.Retry}
                        </div>
                      )}

                      <div
                        className={styles['chat-message-top-action']}
                        onClick={() => copyToClipboard(message.content)}
                      >
                        {Locale.Chat.Actions.Copy}
                      </div>
                    </div>
                  )}
                  {(message.preview || message.content.length === 0) && !isUser ? (
                    <LoadingIcon />
                  ) : (
                    <div
                      className="markdown-body"
                      style={{ fontSize: `${fontSize}px` }}
                      onContextMenu={(e) => onRightClick(e, message)}
                      onDoubleClickCapture={() => {
                        if (!isMobileScreen()) return;
                        setUserInput(message.content);
                      }}
                    >
                      <Markdown content={message.content} />
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className={styles['chat-message-avatar']} style={{ paddingLeft: '10px' }}>
                    <Avatar role={message.role} />
                  </div>
                )}
                {!isUser && !message.preview && (
                  <div className={styles['chat-message-actions']}>
                    <div className={styles['chat-message-action-date']}>
                      {message.date.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles['chat-input-panel']}>
        <PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />
        <div className={styles['chat-input-panel-inner']}>
          <textarea
            ref={inputRef}
            className={styles['chat-input']}
            placeholder={Locale.Chat.Input(submitKey)}
            onInput={(e) => onInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={onInputKeyDown}
            onFocus={() => setAutoScroll(true)}
            onBlur={() => {
              setAutoScroll(false);
              setTimeout(() => setPromptHints([]), 500);
            }}
            autoFocus={!props?.sideBarShowing}
            rows={inputRows}
          />
          <IconButton
            icon={<SendWhiteIcon />}
            text={Locale.Chat.Send}
            className={styles['chat-input-send']}
            noDark
            onClick={onUserSubmit}
          />
        </div>
      </div>
    </div>
  );
}
