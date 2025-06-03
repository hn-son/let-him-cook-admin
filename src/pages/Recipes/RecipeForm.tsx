import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Upload,
    Space,
    Divider,
    Modal,
    InputNumber,
    Select,
    Row,
    Col,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, MenuOutlined } from '@ant-design/icons';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { UploadFile, UploadProps } from 'antd';
import {
    uploadImageToFirebase,
    deleteImageFromFirebase,
    deleteImageByPath,
    uploadImageToFirebaseWithPath,
} from '../../utils/firebaseStorage';
import { useMessage } from '../../components/provider/MessageProvider';

interface RecipeFormValues {
    initialValues?: any;
    onSubmit: (values: any) => Promise<void>;
    loading: boolean;
    title: string;
    visible: boolean;
    onCancel: () => void;
}

const SortableItem = ({ id, index, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        marginBottom: 8,
        alignItems: 'center',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div
                {...listeners}
                style={{
                    cursor: 'grab',
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <MenuOutlined />
            </div>
            {children}
        </div>
    );
};

const RecipeForm: React.FC<RecipeFormValues> = ({
    initialValues,
    onSubmit,
    loading,
    title,
    visible,
    onCancel,
}) => {
    console.log('initialValues:', initialValues);
    const [form] = Form.useForm();
    const [uploadLoaing, setUploadLoading] = useState(false);
    const [uploadedImageUrl, setUploadImageUrl] = useState<string>('');
    const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    console.log('fileList:', fileList);
    const messageApi = useMessage();

    useEffect(() => {
        if (visible) {
            // Kiểm tra và chuẩn bị dữ liệu steps
            let preparedSteps = [];

            if (initialValues?.steps) {
                // Nếu steps là mảng, sử dụng nó
                if (Array.isArray(initialValues.steps)) {
                    preparedSteps = initialValues.steps;
                }
                // Nếu steps là object, log để debug và sử dụng mảng rỗng
                else if (typeof initialValues.steps === 'object') {
                    console.log('Steps is an object:', initialValues.steps);
                    preparedSteps = [];
                }
                // Trường hợp khác, chuyển đổi thành mảng nếu có thể
                else {
                    try {
                        preparedSteps = JSON.parse(initialValues.steps);
                        if (!Array.isArray(preparedSteps)) {
                            preparedSteps = [];
                        }
                    } catch (e) {
                        preparedSteps = [];
                    }
                }
            }

            // Chuẩn bị dữ liệu ingredients
            let preparedIngredients = [];
            if (initialValues?.ingredients && Array.isArray(initialValues.ingredients)) {
                preparedIngredients = initialValues.ingredients;
            }

            // Thiết lập giá trị form
            form.setFieldsValue({
                title: initialValues?.title || '',
                description: initialValues?.description || '',
                cookingTime: initialValues?.cookingTime || null,
                difficulty: initialValues?.difficulty || undefined,
                steps: preparedSteps,
                ingredients: preparedIngredients,
            });
            if (initialValues?.imageUrl) {
                setFileList([
                    {
                        uid: '-1',
                        name: 'img.png',
                        status: 'done',
                        url: initialValues?.imageUrl,
                    },
                ]);
            }
        }
    }, [form, visible, initialValues]);

    const [uploadedImagePath, setUploadedImagePath] = useState<string>(''); // Thêm state để lưu path

    const customUpload = async ({ file, onSuccess, onError }: any) => {
        try {
            setUploadLoading(true);

            // Xóa ảnh cũ nếu có
            if (uploadedImagePath) {
                await deleteImageByPath(uploadedImagePath);
            }

            // Upload ảnh mới và lưu cả URL và path
            const result = await uploadImageToFirebaseWithPath(file);
            setUploadImageUrl(result.url);
            setUploadedImagePath(result.path); // Lưu path để xóa sau này

            // Cập nhật fileList với URL mới
            setFileList([
                {
                    uid: file.uid,
                    name: file.name,
                    status: 'done',
                    url: result.url,
                },
            ]);

            onSuccess(result.url);
            messageApi.success('Upload ảnh thành công!');
        } catch (error) {
            console.error('Upload error:', error);
            onError(error);
            messageApi.error('Upload ảnh thất bại!');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        console.log('New file list:', newFileList);
        setFileList(newFileList);
    };

    const handleRemoveImage = async (file: UploadFile) => {
        try {
            // Xóa bằng path thay vì URL
            if (uploadedImagePath) {
                await deleteImageByPath(uploadedImagePath);
                setUploadedImagePath('');
                setUploadImageUrl(originalImageUrl); // Quay về ảnh gốc nếu có
                messageApi.success('Đã xóa ảnh');
            } else {
                setUploadImageUrl(''); // Xóa hoàn toàn nếu không có ảnh gốc
            }
            return true;
        } catch (error) {
            console.error('Error removing image:', error);
            messageApi.error('Có lỗi khi xóa ảnh');
            return false;
        }
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.response) return;
        window.open(file.response, '_blank');
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const cleanedIngredients =
                values.ingredients?.map((ingredient: any) => ({
                    name: ingredient.name,
                    quantity: ingredient.quantity?.toString() || '0',
                    unit: ingredient.unit,
                })) || [];

            const formData = {
                ...values,
                imageUrl: fileList.length > 0 ? fileList[0].response : '',
                ingredients: cleanedIngredients,
                steps: Array.isArray(values.steps) ? values.steps : [],
                id: initialValues?.id || null,
            };

            console.log('Form Data:', formData);

            await onSubmit(formData);
            form.resetFields();
            setFileList([]);
        } catch (error) {
            console.error('Form validation error:', error);
        }
    };

    const handleCancel = async () => {
        form.resetFields();
        setFileList([]);
        setUploadImageUrl('');
        setUploadedImagePath('');
        setOriginalImageUrl('');
        onCancel();
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = event => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const steps = form.getFieldValue('steps') || [];
            const oldIndex = steps.findIndex((_, i) => `step-${i}` === active.id);
            const newIndex = steps.findIndex((_, i) => `step-${i}` === over.id);

            const newSteps = arrayMove(steps, oldIndex, newIndex);
            form.setFieldsValue({ steps: newSteps });
        }
    };

    const difficultyOptions = [
        { value: 'easy', label: 'Dễ' },
        { value: 'medium', label: 'Trung bình' },
        { value: 'hard', label: 'Khó' },
    ];

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
    );

    return (
        <Modal
            title={title}
            open={visible}
            onCancel={handleCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Hủy bỏ
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Lưu công thức
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" initialValues={initialValues}>
                <Form.Item
                    name="title"
                    label="Tên công thức"
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                    <Input placeholder="Nhập tên công thức" />
                </Form.Item>
                <Form.Item label="Ảnh đại diện">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        customRequest={customUpload}
                        onChange={handleUploadChange}
                        onRemove={handleRemoveImage}
                        onPreview={handlePreview}
                        maxCount={1}
                        accept="image/*"
                        beforeUpload={file => {
                            const isImage = file.type.startsWith('image/');
                            if (!isImage) {
                                messageApi.error('Bạn chỉ có thể tải lên hình ảnh!');
                            }

                            const isLt5M = file.size / 1024 / 1024 < 5;

                            if (!isLt5M) {
                                messageApi.error('Hình ảnh phải nhỏ hơn 5MB!');
                            }

                            return isImage && isLt5M;
                        }}
                    >
                        {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="cookingTime"
                            label="Thời gian nấu"
                            rules={[{ required: true, message: 'Vui lòng nhập thời gian nấu' }]}
                        >
                            <InputNumber
                                min={1}
                                placeholder="Nhập thời gian nấu"
                                style={{ width: '100%' }}
                                addonAfter="phút"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="difficulty"
                            label="Độ khó"
                            rules={[{ required: true, message: 'Vui lòng chọn độ khó' }]}
                        >
                            <Select placeholder="Chọn độ khó" options={difficultyOptions} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                >
                    <Input.TextArea rows={4} placeholder="Nhập mô tả" />
                </Form.Item>
                <Divider orientation="left">Danh sách nguyên liệu</Divider>
                <Form.List name="ingredients">
                    {(field, { add, remove }) => {
                        return (
                            <>
                                {field.map(({ key, name, ...restField }) => (
                                    <div
                                        key={key}
                                        style={{
                                            display: 'flex',
                                            marginBottom: 8,
                                            gap: 8,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'name']}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Vui lòng nhập tên nguyên liệu',
                                                },
                                            ]}
                                            style={{ flex: 2, marginBottom: 0 }}
                                        >
                                            <Input placeholder="Tên nguyên liệu" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'quantity']}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Vui lòng nhập số lượng',
                                                },
                                            ]}
                                            style={{ flex: 1, marginBottom: 0 }}
                                        >
                                            <InputNumber
                                                placeholder="Số lượng"
                                                min={0}
                                                step={0.1}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'unit']}
                                            rules={[
                                                { required: true, message: 'Nhập kiểu đơn vị' },
                                            ]}
                                            style={{ flex: 1, marginBottom: 0 }}
                                        >
                                            <Input placeholder="Kiểu đơn vị" />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={add}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Thêm nguyên liệu
                                    </Button>
                                </Form.Item>
                            </>
                        );
                    }}
                </Form.List>
                <Divider orientation="left">Danh sách các bước thực hiện</Divider>
                <Form.List name="steps">
                    {(fields, { add, remove }) => (
                        <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={fields.map((_, index) => `step-${index}`)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        <SortableItem key={key} id={`step-${index}`} index={index}>
                                            <Form.Item
                                                {...restField}
                                                name={name}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Bước thực hiện không được để trống',
                                                    },
                                                ]}
                                                style={{ flex: 1, marginBottom: 0 }}
                                                getValueProps={value => {
                                                    if (typeof value === 'object') {
                                                        return { value: '' };
                                                    }
                                                    return { value };
                                                }}
                                            >
                                                <Input
                                                    placeholder="Nhập bước thực hiện"
                                                    addonBefore={`Bước ${index + 1}`}
                                                />
                                            </Form.Item>
                                            <MinusCircleOutlined
                                                onClick={() => remove(name)}
                                                style={{ marginLeft: 8 }}
                                            />
                                        </SortableItem>
                                    ))}
                                </SortableContext>
                            </DndContext>
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add('')}
                                    block
                                    icon={<PlusOutlined />}
                                >
                                    Thêm bước thực hiện
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};
export default RecipeForm;
