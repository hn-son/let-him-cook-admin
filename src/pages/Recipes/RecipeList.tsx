import React, { JSX, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Input, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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

const { Title } = Typography;
const { Search } = Input;

const RecipeList = (): JSX.Element => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [searchText, setSearchText] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<any>(null);
    const { setRecipes, recipes, deleteRecipe, addRecipe, updateRecipe } = useRecipeStore();

    const { loading } = useQuery(GET_RECIPES, {
        onCompleted: data => {
            setRecipes(data.recipes);
        },
    });

    const [createRecipeMutation, { loading: createLoading }] = useMutation(CREATE_RECIPE, {
        onCompleted: data => {
            addRecipe(data.createRecipe);
            messageApi.success('Recipe created successfully');
            setFormVisible(false);
        },
        onError: error => {
            messageApi.error(`Failed to create recipe: ${error.message}`);
        },
    });

    const [updateRecipeMutation, { loading: updateLoading }] = useMutation(UPDATE_RECIPE, {
        onCompleted: data => {
            updateRecipe(data.updateRecipe.id, data.updateRecipe);
            messageApi.success('Recipe updated successfully');
            setFormVisible(false);
            setEditingRecipe(null);
        },
        onError: error => {
            messageApi.error(`Failed to update recipe: ${error.message}`);
        },
    });

    const handleCreate = async (values: any) => {
        try {
            await createRecipeMutation({variables: {input: values}})
        } catch (error) {
            console.error(error);
        }
    }

    const handleUpdate = async (values: any) => {
        try {
            await updateRecipeMutation({variables: {input: values}})
        } catch (error) {
            console.error(error);
        }
    }

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
            render: (text: string) => {
                const date = new Date(Number(text));
                // Format as DD/MM/YYYY
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}/${date.getFullYear()}`;
            },
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

    return (
        <div className="recipe-list">
            {contextHolder}
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
            />

            <RecipeForm
                title={editingRecipe ? 'Sửa công thức' : 'Tạo công thức'}
                visible={formVisible}
                onCancel={handleFormCancel}
                initialValues={editingRecipe}
                onSubmit={editingRecipe ? handleUpdate : handleCreate}
                loading={createLoading || updateLoading}
            />
        </div>
    );
};
export default RecipeList;
