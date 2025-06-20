import { useEffect, useState, useRef } from "react";
import { Drawer, Button, Space, Table, TableColumnsType, Popconfirm, App } from "antd";
import EditDictValueDrawer from "./editDictValueDrawer";
import { DictValue } from "@/types/system/dictionary";
import { LocalDict } from "@/types/api";
import { deleteDictValue, getDictSingle } from "@/api/system/dict";

export default function DictValuesDrawer({ open, onClose, currentItem }: {
    open: boolean,
    onClose: (option: { update: boolean }) => void,
    currentItem: Partial<LocalDict>
}) {
    const [editDictValueDrawerVisible, setEditDictValueDrawerVisible] = useState(false);
    const [currentEditDictValue, setCurrentEditDictValue] = useState<DictValue | null>(null);
    const [EditDictValueDrawerTitle, setEditDictValueDrawerTitle] = useState('');
    const [dataSource, setDataSource] = useState<DictValue[]>([]);
    const [loading, setLoading] = useState(false);
    const needUpdate = useRef(false);
    const { message } = App.useApp()
    useEffect(() => {
        if (currentItem && open) {
            setDataSource(currentItem.values!);
        }
    }, [currentItem, open]);
    const columns: TableColumnsType<DictValue> = [
        {
            title: '名称',
            dataIndex: 'name',
            width: 200,
        },
        {
            title: '数据',
            dataIndex: 'value',
            width: 200,
        },
        {
            title: '描述',
            dataIndex: 'description',
            width: 400,
        },
        {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            fixed: 'right',
            width: 200,
            render: (_, record) =>
                <Space>
                    <Button type="link" onClick={() => handleEditDictValue(record)}>编辑</Button>
                    <Popconfirm
                        title="删除字典值"
                        description="确定要删除这个字典值吗？"
                        onConfirm={() => handleDeleteDictValue(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger>删除</Button>
                    </Popconfirm>
                </Space>,
        },
    ];
    const handleCloseEditDictValueDrawer = (option: { update: boolean }) => {
        needUpdate.current = option.update;
        if (option.update) {
            updateDataSource()
        }
        setEditDictValueDrawerVisible(false);
    }
    const handleEditDictValue = (record: DictValue) => {
        setEditDictValueDrawerVisible(true);
        setEditDictValueDrawerTitle('编辑字典值');
        setCurrentEditDictValue(record);
    }
    const handleAdd = () => {
        setEditDictValueDrawerVisible(true);
        setEditDictValueDrawerTitle('新增字典值');
        setCurrentEditDictValue(null);
    }
    const handleDeleteDictValue = (record: DictValue) => {
        deleteDictValue((record._id! as string), currentItem.id!, message).then((res) => {
            updateDataSource()
            needUpdate.current = true;
        }).catch((err) => {
            
        })
    }
    const handleClose = (options: { update: boolean }) => {
        onClose(options);
        setCurrentEditDictValue(null);
    }
    const updateDataSource = () => {
        setLoading(true);
        getDictSingle(currentItem.id!).then((res) => {
            if (res) {
                setDataSource(res.values!);
            }
        }).catch((err) => {
            
        }).finally(() => {
            setLoading(false);
        })

    }
    const handleCloseDrawer = () => {
        handleClose({ update: needUpdate.current });
    }
    return (
        <Drawer
            title="字典值配置"
            open={open}
            onClose={handleCloseDrawer}
            width={800}
            maskClosable={false}
            placement={"left"}
            forceRender
        >
            <Button
                type="primary"
                onClick={handleAdd}
                loading={loading}
            >
                新增
            </Button>
            <Table<DictValue>
                loading={loading}
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                rowKey="_id"
                size="small"
                scroll={{ x: "max-content" }}
            />
            <EditDictValueDrawer
                open={editDictValueDrawerVisible}
                onClose={handleCloseEditDictValueDrawer}
                currentItem={currentEditDictValue}
                title={EditDictValueDrawerTitle}
                dictId={currentItem.id!}
            />
        </Drawer>
    );
}