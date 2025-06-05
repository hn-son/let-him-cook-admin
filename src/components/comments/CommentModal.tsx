import React, { useState } from 'react';
import { Modal, List, Avatar, Typography, Divider, Input, Button, Skeleton, Spin } from 'antd';
import { UserOutlined, LoadingOutlined } from '@ant-design/icons';
import './CommentModal.scss';
import { GET_COMMENTS } from '../../graphql/queries/commentQueries';
import { useQuery } from '@apollo/client';
import { useMessage } from '../provider/MessageProvider';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// Component bình luận tùy chỉnh
const CommentItem = ({ author, avatar, content, datetime, loading = false }: any) => {
    if (loading) {
        return (
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <Skeleton.Avatar active size={40} style={{ marginRight: 16 }} />
                <div style={{ flex: 1 }}>
                    <Skeleton active paragraph={{ rows: 2 }} title={{ width: '30%' }} />
                </div>
            </div>
        );
    }
    return (
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
};

interface CommentModalProps {
    visible: boolean;
    title: string;
    onCancel: () => void;
    recipeId?: string;
    // comments?: any[];
    onAddComment?: (content: string, recipeId: string) => Promise<void>;
}

const CommentModal: React.FC<CommentModalProps> = ({
    visible,
    title,
    onCancel,
    recipeId,
    // comments = [],
    onAddComment,
}) => {
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const messageApi = useMessage();

    const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    const { loading: fetchingComments, error } = useQuery(GET_COMMENTS, {
        variables: { recipeId },
        skip: !visible || !recipeId,
        onCompleted: data => {
            console.log('data', data);
            setComments(data.recipeComments || []);
        },
        onError: error => {
            console.error('Error fetching comments:', error);
            messageApi.error('Không thể tải bình luận. Vui lòng thử lại sau.');
        },
    });

    // Hàm xử lý thêm bình luận
    const handleAddComment = async () => {
        if (!commentText.trim()) {
            messageApi.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        if (onAddComment && recipeId) {
            setSubmitting(true);
            try {
                await onAddComment(commentText, recipeId);
                setCommentText('');
                messageApi.success('Bình luận đã được thêm thành công');
            } catch (error) {
                console.error('Error adding comment:', error);
                messageApi.error('Không thể thêm bình luận. Vui lòng thử lại sau.');
            } finally {
                setSubmitting(false);
            }
        } else {
            // Fallback khi chưa có API
            messageApi.success('Chức năng thêm bình luận sẽ được phát triển sau');
            setCommentText('');
        }
    };

    const renderLoadingComments = () => (
        <>
            {[1, 2, 3].map(key => (
                <CommentItem key={key} loading={true} />
            ))}
        </>
    );

    const renderEmptyState = () => (
        <div
            style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999',
            }}
        >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <Text type="secondary">Chưa có bình luận nào</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
                Hãy là người đầu tiên bình luận về công thức này!
            </Text>
        </div>
    );

    const renderErrorState = () => (
        <div
            style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#ff4d4f',
            }}
        >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <Text type="danger">Không thể tải bình luận</Text>
            <br />
            <Button
                type="link"
                onClick={() => window.location.reload()}
                style={{ padding: 0, marginTop: '8px' }}
            >
                Thử lại
            </Button>
        </div>
    );

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
                <Spin
                    spinning={fetchingComments}
                    indicator={loadingIcon}
                    tip="Đang tải bình luận..."
                >
                    {error ? (
                        renderErrorState()
                    ) : fetchingComments ? (
                        <div>
                            <div style={{ marginBottom: '16px' }}>
                                <Skeleton.Input style={{ width: '150px' }} active />
                            </div>
                            {renderLoadingComments()}
                        </div>
                    ) : (
                        <List
                            header={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Text strong>{comments.length} bình luận</Text>
                                    {submitting && <Spin size="small" />}
                                </div>
                            }
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
                            locale={{
                                emptyText: renderEmptyState(),
                            }}
                        />
                    )}
                </Spin>
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <TextArea
                    rows={4}
                    placeholder="Viết bình luận của bạn..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    style={{ marginBottom: 16 }}
                    disabled={submitting}
                    maxLength={500}
                    showCount
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }} disabled={submitting}>
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleAddComment}
                        loading={submitting}
                        disabled={!commentText.trim()}
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CommentModal;
