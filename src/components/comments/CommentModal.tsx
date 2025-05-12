import React, { useState } from 'react';
import { Modal, List, Avatar, Typography, Divider, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './CommentModal.scss'

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// Component bình luận tùy chỉnh
const CommentItem = ({ author, avatar, content, datetime }: any) => (
    <div style={{ display: 'flex', marginBottom: 16 }}>
        <Avatar
            src={avatar}
            size={40}
            icon={!avatar && <UserOutlined />}
            style={{ marginRight: 16 }}
        />
        <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>{author}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {datetime}
                </Text>
            </div>
            <Paragraph style={{ marginTop: 4 }}>{content}</Paragraph>
        </div>
    </div>
);

interface CommentModalProps {
    visible: boolean;
    title: string;
    onCancel: () => void;
    recipeId?: string;
    comments?: any[];
    onAddComment?: (content: string, recipeId: string) => Promise<void>;
}

const CommentModal: React.FC<CommentModalProps> = ({
    visible,
    title,
    onCancel,
    recipeId,
    comments = [],
    onAddComment,
}) => {
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Hàm xử lý thêm bình luận
    const handleAddComment = async () => {
        if (!commentText.trim()) {
            message.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        if (onAddComment && recipeId) {
            setSubmitting(true);
            try {
                await onAddComment(commentText, recipeId);
                setCommentText('');
                message.success('Bình luận đã được thêm thành công');
            } catch (error) {
                console.error('Error adding comment:', error);
                message.error('Không thể thêm bình luận. Vui lòng thử lại sau.');
            } finally {
                setSubmitting(false);
            }
        } else {
            // Fallback khi chưa có API
            message.success('Chức năng thêm bình luận sẽ được phát triển sau');
            setCommentText('');
        }
    };

    return (
        <Modal
            title={title}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={700}
            destroyOnClose
        >
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 16 }}>
                <List
                    header={`${comments.length} bình luận`}
                    itemLayout="horizontal"
                    dataSource={comments}
                    renderItem={item => (
                        <CommentItem
                            author={item.author}
                            avatar={item.avatar}
                            content={item.content}
                            datetime={item.datetime}
                        />
                    )}
                    locale={{ emptyText: 'Chưa có bình luận nào' }}
                />
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <TextArea
                    rows={4}
                    placeholder="Viết bình luận của bạn..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>
                        Hủy
                    </Button>
                    <Button type="primary" onClick={handleAddComment} loading={submitting}>
                        Gửi bình luận
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CommentModal;
