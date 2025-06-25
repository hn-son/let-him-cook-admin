import React, { JSX, useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, Input, Typography } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    CommentOutlined,
    ClearOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
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
import { debounce } from 'lodash';
import authStore from '../../store/authStore'

const { Title } = Typography;
const { Search } = Input;

const RecipeList = (): JSX.Element => {
    const messageApi = useMessage();
    const [searchText, setSearchText] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<any>(null);
    const { setRecipes, recipes, deleteRecipe, addRecipe, updateRecipe } = useRecipeStore();
    const currentUser = authStore((state) => state.user);
    const isAdmin = currentUser?.role === 'admin';
    const currentUserId = currentUser?.id || '';

    // Comment modal state
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState<any>(null);

    // Search state
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    console.log({searchResults})

    // Main query to get all recipes
    const { loading: loadingAllRecipes, refetch: refetchAllRecipes } = useQuery(GET_RECIPES, {
        variables: { search: null, limit: 20, offset: 0 },
        onCompleted: data => {
            debugger
            setRecipes(data.recipes);
            // Always update searchResults when not actively searching
            if (!isSearching) {
                setSearchResults(data.recipes);
            }
        },
        onError: error => {
            messageApi.error(`Không thể tải danh sách công thức: ${error.message}`);
        },
    });

    // Lazy query for search
    const [searchRecipes, { loading: loadingSearch }] = useLazyQuery(GET_RECIPES, {
        onCompleted: data => {
            debugger
            setSearchResults(data.recipes);
            setIsSearching(true);
        },
        onError: error => {
            messageApi.error(`Không thể tìm kiếm công thức: ${error.message}`);
        },
        fetchPolicy: 'network-only',
    });

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchTerm: string) => {
            if (searchTerm.trim()) {
                searchRecipes({
                    variables: {
                        search: searchTerm.trim(),
                        limit: 20,
                        offset: 0,
                    },
                });
            } else {
                handleClearSearch();
            }
        }, 500),
        [searchRecipes]
    );

    useEffect(() => {
        debouncedSearch(searchText);
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchText, debouncedSearch]);

    // Initialize searchResults when recipes change and not searching
    // useEffect(() => {
    //     if (!isSearching) {
    //         setSearchResults(recipes);
    //     }
    // }, [recipes, isSearching]);

    // Search handlers
    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleClearSearch = () => {
        setSearchText('');
        setIsSearching(false);
        setSearchResults(recipes); // Use current recipes from store
    };

    // Mutations
    const [createRecipeMutation, { loading: createLoading }] = useMutation(CREATE_RECIPE, {
        onCompleted: data => {
            addRecipe(data.createRecipe);
            messageApi.success('Tạo công thức thành công');
            setFormVisible(false);

            if (isSearching && searchText.trim()) {
                debouncedSearch(searchText);
            } else {
                // Update searchResults immediately if not searching
                setSearchResults(prev => [...prev, data.createRecipe]);
            }
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

            if (isSearching && searchText.trim()) {
                debouncedSearch(searchText);
            } else {
                // Update searchResults immediately if not searching
                setSearchResults(prev => 
                    prev.map(recipe => 
                        recipe.id === data.updateRecipe.id ? data.updateRecipe : recipe
                    )
                );
            }
        },
        onError: error => {
            messageApi.error(`Failed to update recipe: ${error.message}`);
        },
    });

    const [deleteRecipeMutation] = useMutation(DELETE_RECIPE, {
        onCompleted: () => {
            messageApi.success('Recipe deleted successfully');
        },
        onError: error => {
            messageApi.error(`Failed to delete recipe: ${error.message}`);
        },
    });

    // CRUD handlers
    const handleCreate = async (values: any) => {
        try {
            await createRecipeMutation({ variables: { input: values } });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (values: any) => {
        try {
            await updateRecipeMutation({ variables: { id: values.id, input: values } });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteRecipeMutation({ variables: { id } });
            deleteRecipe(id);
            setSearchResults(prev => prev.filter(recipe => recipe.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    // Form handlers
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

    // Comment handlers
    const showComments = (recipe: any) => {
        setCurrentRecipe(recipe);
        setCommentsVisible(true);
    };

    const handleCommentsCancel = () => {
        setCommentsVisible(false);
        setCurrentRecipe(null);
    };

    const handleRefresh = () => {
        refetchAllRecipes();
    };

    // Table columns
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
                        title="Are you sure want to delete this"
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

    const loading = loadingAllRecipes || loadingSearch;

    return (
        <div className="recipe-list">
            <div className="page-header">
                <Title level={2}>
                    Danh sách món ăn{' '}
                    {isSearching && (
                        <span style={{ fontSize: '16px', color: '#666', marginLeft: '16px' }}>
                            ({searchResults.length} kết quả cho "{searchText}")
                        </span>
                    )}
                </Title>
                <div className="header-actions">
                    <Search
                        placeholder="Tìm kiếm công thức theo tên, nguyên liệu"
                        allowClear
                        value={searchText}
                        onChange={e => handleSearch(e.target.value)}
                        onSearch={handleSearch}
                        loading={loadingSearch}
                        style={{ width: 250, marginRight: 16 }}
                    />
                    <Button
                        type="default"
                        icon={<SearchOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                        style={{ marginRight: 16 }}
                    >
                        Làm mới
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={showCreateForm}>
                        Thêm công thức món ăn
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={searchResults}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} công thức`,
                }}
                locale={{
                    emptyText: isSearching
                        ? `Không tìm thấy công thức nào với từ khóa "${searchText}"`
                        : 'Không có dữ liệu',
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

            {currentRecipe && (
                <CommentModal
                    visible={commentsVisible}
                    title={`Bình luận cho: ${currentRecipe.title}`}
                    onCancel={handleCommentsCancel}
                    recipeId={currentRecipe.id}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
};

export default RecipeList;
