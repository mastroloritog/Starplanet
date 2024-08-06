import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function CommentsSection({ mediaId, type }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [replyingTo, setReplyingTo] = useState(null); // Stato per tracciare a quale commento si sta rispondendo

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/comments/getComments', { movie_id: mediaId });
        if (response.data.success) {
          const commentsWithReplies = await Promise.all(response.data.comments_list.map(async (comment) => {
            const repliesResponse = await axios.post('http://localhost:5000/api/comments/getReplies', { comment_id: comment.id });

            return {
              ...comment,
              replies: repliesResponse.data.success ? repliesResponse.data.replies_list : [] // Carica le risposte
            };
          }));
          setComments(commentsWithReplies);
        } else {
          console.error('Error fetching comments:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [mediaId]);

  const handleCommentSubmit = async () => {
    if (userId === -1) {
      navigate("/signin");
    } else {
      try {
        if (replyingTo) {
          // Aggiungere una risposta
          const response = await axios.post('http://localhost:5000/api/comments/addReply', {
            userId,
            commentId: replyingTo,
            reply: newComment
          });
          if (response.data.success) {
            const updatedComments = comments.map(comment => {
              if (comment.id === replyingTo) {
                return {
                  ...comment,
                  replies: [
                    ...comment.replies,
                    {
                      id: response.data.replyId,
                      comment_id: replyingTo,
                      user_id: userId,
                      reply: newComment,
                      created_at: new Date(),
                      username: 'You, now', // Aggiorna con lo username attuale se disponibile
                    }
                  ]
                };
              }
              return comment;
            });
            setComments(updatedComments);
            setNewComment('');
            setReplyingTo(null); // Resetta lo stato di risposta
          } else {
            alert('Error adding reply: ' + response.data.message);
          }
        } else {
          // Aggiungere un nuovo commento
          const response = await axios.post('http://localhost:5000/api/comments/addComment', {
            userId,
            movieId: mediaId,
            comment: newComment
          });
          if (response.data.success) {
            const newCommentWithReplies = {
              ...response.data.comment,
              username: "You, now",
              replies: [] // Le nuove risposte saranno vuote
            };
            setComments([...comments, newCommentWithReplies]);
            setNewComment('');
          } else {
            alert('Error adding comment: ' + response.data.message);
          }
        }
      } catch (error) {
        alert('Error adding comment/reply: ' + error);
      }
    }
  };

  return (
    <Box sx={{ mt: 2, fontFamily: 'Poppins, sans-serif' }}>
      <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>Comments</Typography>
      <Box sx={{ mt: 1, fontFamily: 'Poppins, sans-serif'  }}>
        {comments.map((comment) => (
          <Box key={comment.id} sx={{ mb: 3, fontFamily: 'Poppins, sans-serif' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'Poppins, sans-serif' }}>
              {comment.username}: {comment.comment}
              <IconButton onClick={() => setReplyingTo(comment.id)} size="small" sx={{ ml: 1 }}>
                <ReplyIcon fontSize="small" sx={{ color: 'gray' }} />
              </IconButton>
            </Typography>
            {/* Sezione risposte per ciascun commento */}
            {comment.replies.map((reply) => (
              <Box key={reply.id} sx={{ ml: 3, mt: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  <strong>{reply.username}</strong>: {reply.reply}
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      {replyingTo && (
        <Typography variant="body2" sx={{ mt: 2, mb: 1, fontFamily: 'Poppins, sans-serif' }}>
          Stai rispondendo a: <strong>{comments.find(comment => comment.id === replyingTo)?.username}</strong>
        </Typography>
      )}
      <Box sx={{ display: 'flex', mt: 2, fontFamily: 'Poppins, sans-serif' }}>
        <TextField
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          label="Add a comment"
          fullWidth
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        />
        <Button
          onClick={handleCommentSubmit}
          startIcon={<SendIcon />}
          sx={{
            ml: 1,
            color: "#fff",
            border: "solid 1px #1E1E1E",
            '&:hover': {
              borderColor: "#fff",
            }
          }}
        />
      </Box>
    </Box>
  );
}

export default CommentsSection;
