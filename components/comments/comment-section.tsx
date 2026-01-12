'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import Turnstile from '@/components/ui/turnstile';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, Edit2, Trash2 } from 'lucide-react';

interface Comment {
  _id: string;
  authorId: {
    _id: string;
    name: string;
    displayName?: string;
    avatarUrl?: string;
  };
  body: string;
  createdAt: string;
  editedAt?: string;
  status: string;
  replies?: Comment[];
}

export default function CommentSection({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!newComment.trim()) return;

    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      alert('Please complete the security check');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment, turnstileToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      setNewComment('');
      setTurnstileToken('');
      await fetchComments();
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!session || !replyText.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText, parentId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post reply');
      }

      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update comment');
      }

      setEditText('');
      setEditingComment(null);
      await fetchComments();
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      await fetchComments();
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete comment');
    }
  };

  const startEditingComment = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditText(comment.body);
  };

  const canEditComment = (comment: Comment) => {
    if (!session || comment.authorId._id !== session.user.id) return false;
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return new Date(comment.createdAt) > fifteenMinutesAgo;
  };

  const canDeleteComment = (comment: Comment) => {
    if (!session) return false;
    const isAuthor = comment.authorId._id === session.user.id;
    const isModerator = session.user.role === 'admin' || session.user.role === 'moderator';
    return isAuthor || isModerator;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading comments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {session ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                placeholder="Share your thoughts about this event..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={2000}
                rows={3}
                disabled={submitting}
              />
              <Turnstile
                onVerify={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken('')}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/2000 characters
                </span>
                <Button type="submit" disabled={submitting || !newComment.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/auth/signin')}>
              Sign in
            </Button>
            {' '}to join the conversation
          </AlertDescription>
        </Alert>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment._id}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.authorId.avatarUrl} />
                    <AvatarFallback>
                      {comment.authorId.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {comment.authorId.displayName || comment.authorId.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.editedAt && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                    </div>

                    {/* Comment body or edit form */}
                    {editingComment === comment._id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          maxLength={2000}
                          rows={3}
                          disabled={submitting}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment._id)}
                            disabled={submitting || !editText.trim()}
                          >
                            {submitting ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap break-words">{comment.body}</p>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-2">
                          {session && replyingTo !== comment._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => setReplyingTo(comment._id)}
                            >
                              Reply
                            </Button>
                          )}
                          {canEditComment(comment) && editingComment !== comment._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => startEditingComment(comment)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {canDeleteComment(comment) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-destructive"
                              onClick={() => handleDeleteComment(comment._id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </>
                    )}

                    {/* Reply form */}
                    {replyingTo === comment._id && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          maxLength={2000}
                          rows={2}
                          disabled={submitting}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment._id)}
                            disabled={submitting || !replyText.trim()}
                          >
                            {submitting ? 'Posting...' : 'Post Reply'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-border space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reply.authorId.avatarUrl} />
                              <AvatarFallback>
                                {reply.authorId.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {reply.authorId.displayName || reply.authorId.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap break-words">{reply.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

