import React, { useState } from 'react';
import {
    Modal,
    List,
    Avatar,
    Typography,
    Divider,
    Input,
    Button,
    Skeleton,
    Spin,
    Checkbox,
    Dropdown,
    Space,
    Popconfirm,
} from 'antd';
import {
    UserOutlined,
    LoadingOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    SaveOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import './CommentModal.scss';
import { GET_COMMENTS } from '../../graphql/queries/commentQueries';
import {
    ADD_COMMENT,
    DELETE_COMMENT,
    MULTIPLE_DELETE_COMMENTS,
    UPDATE_COMMENT,
} from '../../graphql/mutations/commentMutations';
import { useQuery, useMutation } from '@apollo/client';
import { useMessage } from '../provider/MessageProvider';
import formatDate from '../../utils/formatDate';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// Component bình luận tùy chỉnh
const CommentItem = ({
    comment,
    loading = false,
    currentUserId = null,
    isAdmin = false,
    onEdit,
    onDelete,
    onEditSave,
    onEditCancel,
    editingCommentId,
    editingContent,
    onEditContentChange,
    isSelected = false,
    onSelect,
    showCheckbox = false,
}: any) => {
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

    const isOwner = currentUserId && comment.author?.id === currentUserId;
    const canEdit = isOwner;
    const canDelete = isAdmin || isOwner;
    const isEditing = editingCommentId === comment.id;

    const menuItems = [];

    if (canEdit) {
        menuItems.push({
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <EditOutlined />,
            onClick: () => onEdit(comment.id, comment.content),
        });
    }

    if (canDelete) {
        menuItems.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa',
            onClick: () => onDelete(comment.id),
        });
    }

    return (
        <div style={{ display: 'flex', marginBottom: 16 }}>
            {showCheckbox && (
                <Checkbox
                    onChange={e => onSelect(comment.id, e.target.checked)}
                    checked={isSelected}
                />
            )}
            <Avatar
                src={comment?.avatar}
                size={40}
                icon={!comment?.avatar && <UserOutlined />}
                style={{ marginRight: 16 }}
            />
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}
                >
                    <div>
                        <Text strong>{comment?.author.username || 'Ẩn danh'}</Text>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
                            {formatDate(comment?.createdAt)}
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                <span style={{ marginLeft: 8, fontStyle: 'italic' }}>
                                    • đã chỉnh sửa
                                </span>
                            )}
                        </div>
                    </div>
                    {menuItems.length > 0 && !isEditing && (
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="text"
                                icon={<MoreOutlined />}
                                size="small"
                                style={{ color: '#999' }}
                            />
                        </Dropdown>
                    )}
                </div>
                {isEditing ? (
                    <div style={{ marginTop: 8 }}>
                        <TextArea
                            value={editingContent}
                            onChange={e => onEditContentChange(e.target.value)}
                            rows={3}
                            maxLength={500}
                            showCount
                            style={{ marginBottom: 8 }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                icon={<SaveOutlined />}
                                onClick={() => onEditSave(comment.id)}
                                disabled={!editingContent.trim()}
                            >
                                Lưu
                            </Button>
                            <Button size="small" icon={<CloseOutlined />} onClick={onEditCancel}>
                                Hủy
                            </Button>
                        </Space>
                    </div>
                ) : (
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                        {comment.content}
                    </Paragraph>
                )}
            </div>
        </div>
    );
};

interface CommentModalProps {
    visible: boolean;
    title: string;
    onCancel: () => void;
    recipeId?: string;
    currentUserId?: string;
    isAdmin?: boolean;
}

const CommentModal: React.FC<CommentModalProps> = ({
    visible,
    title,
    onCancel,
    recipeId,
    currentUserId,
    isAdmin,
}) => {
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const messageApi = useMessage();
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [selectedComments, setSelectedComments] = useState<string[]>([]);
    const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

    const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    const { loading: fetchingComments, error } = useQuery(GET_COMMENTS, {
        variables: { recipeId },
        skip: !visible || !recipeId,
        onCompleted: data => {
            setComments(data.recipeComments || []);
        },
        onError: error => {
            console.error('Error fetching comments:', error);
            messageApi.error('Không thể tải bình luận. Vui lòng thử lại sau.');
        },
    });

    const [addCommentMutation, { loading: submitting }] = useMutation(ADD_COMMENT, {
        onCompleted: data => {
            messageApi.success('Bình luận đã được thêm thành công');
            setCommentText('');
            const newComment = data.addComment;

            setComments(prev => [newComment, ...prev]);
        },
        onError: error => {
            console.error('Error adding comment:', error);
            messageApi.error('Không thể thêm bình luận. Vui lòng thử lại sau.');
        },
        update: (cache, { data }) => {
            try {
                const existingComments = cache.readQuery({
                    query: GET_COMMENTS,

                    variables: {
                        recipeId,
                    },
                });

                if (existingComments) {
                    cache.writeQuery({
                        query: GET_COMMENTS,
                        variables: { recipeId },
                        data: {
                            recipeComments: [
                                data.addComment,
                                ...(existingComments as any).recipeComments,
                            ],
                        },
                    });
                }
            } catch (error) {}
        },
    });

    const [updateCommentMutation, { loading: updating }] = useMutation(UPDATE_COMMENT, {
        onCompleted: data => {
            messageApi.success('Bình luận đã được cập nhật');
            setEditingCommentId(null);
            setEditingContent('');
            setComments(prev =>
                prev.map(comment =>
                    comment.id === data.updateComment.id ? data.updateComment : comment
                )
            );
        },
        onError: error => {
            console.error('Error updating comment:', error);
            messageApi.error('Không thể cập nhật bình luận. Vui lòng thử lại sau.');
        },
    });

    const [deleteCommentMutation, { loading: deleting }] = useMutation(DELETE_COMMENT, {
        onCompleted: data => {
            messageApi.success('Bình luận đã được xóa');
            setComments(prev => prev.filter(comment => comment.id !== data.deleteComment.id));
        },
        onError: error => {
            console.error('Error deleting comment:', error);
            messageApi.error('Không thể xóa bình luận. Vui lòng thử lại sau.');
        },
    });

    const [deleteMultipleCommentsMutation, { loading: bulkDeleting }] = useMutation(
        MULTIPLE_DELETE_COMMENTS,
        {
            onCompleted: data => {
                messageApi.success('Bình luận đã được xóa');
                setComments(prev => prev.filter(comment => !selectedComments.includes(comment.id)));
                setSelectedComments([]);
                setBulkDeleteMode(false);
            },
            onError: error => {
                console.error('Error deleting multiple comments:', error);
                messageApi.error('Không thể xóa bình luận. Vui lòng thử lại sau.');
            },
        }
    );

    // Hàm xử lý thêm bình luận
    const handleAddComment = async () => {
        if (!commentText.trim()) {
            messageApi.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        if (!recipeId) {
            messageApi.error('Không tìm thấy công thức để bình luận');
            return;
        }

        try {
            await addCommentMutation({
                variables: {
                    recipeId,
                    content: commentText.trim(),
                },
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            messageApi.error('Không thể thêm bình luận. Vui lòng thử lại sau.');
        }
    };

    const handleEditComment = (commentId: string, currentContent: string) => {
        setEditingCommentId(commentId);
        setEditingContent(currentContent);
    };

    const handleEditCancel = () => {
        setEditingCommentId(null);
        setEditingContent('');
    };

    const handleEditSave = async (commentId: string) => {
        if (!editingContent.trim()) {
            messageApi.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        try {
            await updateCommentMutation({
                variables: {
                    id: commentId,
                    content: editingContent.trim(),
                },
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            messageApi.error('Không thể cập nhật bình luận. Vui lòng thử lại sau.');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteCommentMutation({
                variables: { id: commentId },
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            messageApi.error('Không thể xóa bình luận. Vui lòng thử lại sau.');
        }
    };

    const handleSelectComment = (commentId: string, selected: boolean) => {
        if (selected) {
            setSelectedComments(prev => [...prev, commentId]);
        } else {
            setSelectedComments(prev => prev.filter(id => id !== commentId));
        }
    };

    const handleSelectedAll = (checked: boolean) => {
        if (checked) {
            setSelectedComments(comments.map(comment => comment.id));
        } else {
            setSelectedComments([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedComments.length === 0) {
            messageApi.warning('Vui lòng chọn bình luận để xóa');
            return;
        }

        try {
            await deleteMultipleCommentsMutation({
                variables: {
                    commentIds: selectedComments,
                },
            });
        } catch (error) {
            console.error('Error deleting multiple comments:', error);
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
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <Text strong>{comments.length} bình luận</Text>
                                        {(submitting || updating || deleting || bulkDeleting) && (
                                            <Spin size="small" />
                                        )}
                                    </div>
                                    {isAdmin && comments.length > 0 && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            {!bulkDeleteMode ? (
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    onClick={() => setBulkDeleteMode(true)}
                                                >
                                                    Xóa nhiều
                                                </Button>
                                            ) : (
                                                <Space>
                                                    <Checkbox
                                                        onChange={e =>
                                                            handleSelectedAll(e.target.checked)
                                                        }
                                                        checked={
                                                            selectedComments.length ===
                                                            comments.length
                                                        }
                                                        indeterminate={
                                                            selectedComments.length > 0 &&
                                                            selectedComments.length <
                                                                comments.length
                                                        }
                                                    >
                                                        Chọn tất cả
                                                    </Checkbox>
                                                    <Popconfirm
                                                        title={`Bạn có chắc chắn muốn xóa ${selectedComments.length} bình luận này không?`}
                                                        onConfirm={handleBulkDelete}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                        disabled={selectedComments.length === 0}
                                                    >
                                                        <Button
                                                            danger
                                                            size="small"
                                                            loading={bulkDeleting}
                                                            disabled={selectedComments.length === 0}
                                                        >
                                                            Xóa ({selectedComments.length})
                                                        </Button>
                                                    </Popconfirm>
                                                    <Button
                                                        size="small"
                                                        onClick={() => {
                                                            setBulkDeleteMode(false);
                                                            setSelectedComments([]);
                                                        }}
                                                    >
                                                        Hủy
                                                    </Button>
                                                </Space>
                                            )}
                                        </div>
                                    )}
                                </div>
                            }
                            itemLayout="horizontal"
                            dataSource={comments}
                            renderItem={comment => (
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa bình luận này không?"
                                    onConfirm={() => handleDeleteComment(comment.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    disabled={editingCommentId === comment.id}
                                >
                                    <div>
                                        <CommentItem
                                            comment={comment}
                                            isAdmin={isAdmin}
                                            currentUserId={currentUserId}
                                            onEdit={handleEditComment}
                                            onDelete={() => {}}
                                            onEditSave={handleEditSave}
                                            onEditCancel={handleEditCancel}
                                            editingCommentId={editingCommentId}
                                            editingContent={editingContent}
                                            onEditContentChange={setEditingContent}
                                            isSelected={selectedComments.includes(comment.id)}
                                            onSelect={handleSelectComment}
                                            showCheckbox={bulkDeleteMode}
                                        />
                                    </div>
                                </Popconfirm>
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
