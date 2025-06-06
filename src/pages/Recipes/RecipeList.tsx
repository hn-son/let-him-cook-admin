import React, { JSX, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Input, Typography } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    CommentOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { GET_RECIPES } from '../../graphql/queries/recipeQueries';
import {
    DELETE_RECIPE,
    CREATE_RECIPE,
    UPDATE_RECIPE,
} from '../../graphql/mutations/recipeMutations';
import useRecipeStore from '../../store/recipeStore';
import RecipeForm from './RecipeForm';
import CommentModal from '../../components/comments/CommentModal';
import { useMessage } from '../../components/provider/MessageProvider';
import formatDate from '../../utils/formatDate';

const { Title } = Typography;   
const { Search } = Input;

const RecipeList = (): JSX.Element => {
    const navigate = useNavigate();
    const messageApi = useMessage();
    const [searchText, setSearchText] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<any>(null);
    const { setRecipes, recipes, deleteRecipe, addRecipe, updateRecipe } = useRecipeStore();

    // State cho modal bình luận
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState<any>(null);
    console.log({currentRecipe})

    const { loading } = useQuery(GET_RECIPES, {
        onCompleted: data => {
            setRecipes(data.recipes);
        },
    });

    const [createRecipeMutation, { loading: createLoading }] = useMutation(CREATE_RECIPE, {
        onCompleted: data => {
            addRecipe(data.createRecipe);
            messageApi.success('Tạo công thức thành công');
            setFormVisible(false);
        },
        onError: error => {
            messageApi.error(`Failed to create recipe: ${error.message}`);
        },
    });

    const [updateRecipeMutation, { loading: updateLoading }] = useMutation(UPDATE_RECIPE, {
        onCompleted: data => {
            updateRecipe(data.updateRecipe.id, data.updateRecipe);
            messageApi.success('Cập nhật công thức thành công');
            setFormVisible(false);
            setEditingRecipe(null);
        },
        onError: error => {
            messageApi.error(`Failed to update recipe: ${error.message}`);
        },
    });

    const handleCreate = async (values: any) => {
        try {
            await createRecipeMutation({ variables: { input: values } });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (values: any ) => {
        try {
            await updateRecipeMutation({ variables: { id: values.id,input: values } });
        } catch (error) {
            console.error(error);
        }
    };

    const [deleteRecipeMutation] = useMutation(DELETE_RECIPE, {
        onCompleted: () => {
            messageApi.success('Recipe deleted successfully');
        },
        onError: error => {
            messageApi.error(`Failed to delete recipe: ${error.message}`);
        },
    });

    const handleDelete = async (id: string) => {
        try {
            await deleteRecipeMutation({ variables: { id } });
            deleteRecipe(id);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const showCreateForm = () => {
        setEditingRecipe(null);
        setFormVisible(true);
    };

    const showUpdateForm = (recipe: any) => {
        setEditingRecipe(recipe);
        setFormVisible(true);
    };

    const handleFormCancel = () => {
        setFormVisible(false);
        setEditingRecipe(null);
    };

    const showComments = (recipe: any) => {
        setCurrentRecipe(recipe);
        setCommentsVisible(true);
    };

    const handleCommentsCancel = () => {
        setCommentsVisible(false);
        setCurrentRecipe(null);
    };

    const handleAddComment = async (content: string, recipeId: string) => {
        // Đây là nơi để gọi API thêm bình luận trong tương lai
        console.log('Adding comment:', content, 'for recipe:', recipeId);
        // Giả lập delay của API call
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    };

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'title',
            key: 'title',
            sorter: (a: any, b: any) => a.title.localeCompare(b.title),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Thời gian tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: formatDate,
            sorter: (a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space size={'middle'}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showUpdateForm(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="default"
                        icon={<CommentOutlined />}
                        onClick={() => showComments(record)}
                    >
                        Bình luận
                    </Button>
                    <Popconfirm
                        title="Are you  sure want to delete this"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Dữ liệu bình luận mẫu (sau này sẽ được lấy từ API)
    const sampleComments = [
        {
            author: 'Người dùng 1',
            avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
            content: 'Công thức này rất ngon, tôi đã thử làm và thành công!',
            datetime: '2023-10-15 14:30',
        },
        {
            author: 'Người dùng 2',
            avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
            content: 'Tôi thấy công thức này hơi phức tạp, có cách nào đơn giản hơn không?',
            datetime: '2023-10-16 09:45',
        },
        {
            author: 'Người dùng 3',
            avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
            content: 'Tôi đã thay thế một số nguyên liệu và vẫn rất ngon!',
            datetime: '2023-10-17 18:20',
        },
    ];

    return (
        <div className="recipe-list">
            <div className="page-header">
                <Title level={2}>Danh sách món ăn</Title>
                <div className="header-actions">
                    <Search
                        placeholder="Tìm kiếm công thức theo tên, nguyên liệu"
                        allowClear
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250, marginRight: 16 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={showCreateForm}>
                        Thêm công thức món ăn
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filteredRecipes}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{
                    emptyText: 'Không có dữ liệu',
                }}
            />

            <RecipeForm
                title={editingRecipe ? 'Sửa công thức' : 'Tạo công thức'}
                visible={formVisible}
                onCancel={handleFormCancel}
                initialValues={editingRecipe}
                onSubmit={editingRecipe ? handleUpdate : handleCreate}
                loading={createLoading || updateLoading}
            />

            {/* Sử dụng component CommentModal */}
            {currentRecipe && (
                <CommentModal
                    visible={commentsVisible}
                    title={`Bình luận cho: ${currentRecipe.title}`}
                    onCancel={handleCommentsCancel}
                    recipeId={currentRecipe.id}
                    onAddComment={handleAddComment}
                />
            )}
        </div>
    );
};
export default RecipeList;
