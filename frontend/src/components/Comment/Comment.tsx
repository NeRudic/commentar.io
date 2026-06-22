import { useState } from "react";
import styles from "./Comment.module.css";

export interface ReplyData {
  id: string;
  username: string;
  text: string;
  time: string;
  replies: ReplyData[];
}

interface CommentProps {
  comments: ReplyData[];
  onAddReply: (parentId: string, text: string) => void;
  depth?: number;
}

function ReplyInput({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className={styles.replyInput}>
      <input
        className={styles.replyField}
        type="text"
        placeholder="Write a reply…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            onSubmit(text.trim());
            setText("");
          }
          if (e.key === "Escape") onCancel();
        }}
        autoFocus
      />
      <button
        className={styles.replyCancel}
        onClick={onCancel}
        aria-label="Cancel reply"
      >
        Cancel
      </button>
    </div>
  );
}

function CommentItem({
  comment,
  onAddReply,
  depth,
  replyingTo,
  setReplyingTo,
}: {
  comment: ReplyData;
  onAddReply: (parentId: string, text: string) => void;
  depth: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
}) {
  const isReplying = replyingTo === comment.id;

  return (
    <div
      className={styles.commentItem}
      style={{ marginLeft: depth > 0 ? 24 : 0 }}
    >
      <div className={styles.commentBody}>
        <span className={styles.commentAvatar}>{comment.username[0].toUpperCase()}</span>
        <div className={styles.commentContent}>
          <span className={styles.commentUser}>{comment.username}</span>
          <span className={styles.commentText}>{comment.text}</span>
          <div className={styles.commentMeta}>
            <span className={styles.commentTime}>{comment.time}</span>
            <button
              className={styles.replyBtn}
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {isReplying && (
        <ReplyInput
          onSubmit={(text) => {
            onAddReply(comment.id, text);
            setReplyingTo(null);
          }}
          onCancel={() => setReplyingTo(null)}
        />
      )}

      {comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onAddReply={onAddReply}
              depth={depth + 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function flattenComments(comments: ReplyData[]): ReplyData[] {
  const result: ReplyData[] = [];
  function walk(list: ReplyData[]) {
    for (const c of list) {
      result.push(c);
      walk(c.replies);
    }
  }
  walk(comments);
  return result;
}

export default function Comment({
  comments,
  onAddReply,
  depth = 0,
}: CommentProps) {
  const allFlat = flattenComments(comments);
  const commentCount = allFlat.length;
  const [topText, setTopText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  return (
    <div className={styles.commentSection}>
      <div className={styles.commentCount}>
        <span>Comments ({commentCount})</span>
      </div>

      <div className={styles.topInput}>
        <span className={styles.topAvatar}>Y</span>
        <input
          className={styles.topField}
          type="text"
          placeholder="Add a comment…"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && topText.trim()) {
              onAddReply("root", topText.trim());
              setTopText("");
            }
          }}
        />
        <button
          className={styles.topPostBtn}
          onClick={() => {
            if (topText.trim()) {
              onAddReply("root", topText.trim());
              setTopText("");
            }
          }}
        >
          Post
        </button>
      </div>

      <div className={styles.commentList}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onAddReply={onAddReply}
            depth={depth}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
          />
        ))}
      </div>
    </div>
  );
}
