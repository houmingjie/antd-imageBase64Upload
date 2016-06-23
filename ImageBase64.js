/**
 * 图片转换为base64保存在表单中，目前仅支持单文件
 * props:maxSize:最大大小,单位：字节
 */
import React, { Component, PropTypes } from 'react';
import {Upload,Row, Col, Form, Modal, Input, Spin,Radio,Button,Icon,message} from 'antd';

export default class ImageBase64 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileList:[],
        };
    }

    name="图片";
    uid=-1;

    componentWillReceiveProps(newProp){//清空表单域时清空图片列表

        if(!newProp.value){
            this.setState({
                fileList:[]
            });
        }else{
            this.setState({
                fileList:[{
                    uid: this.uid,
                    name: this.name,
                    status: 'done',
                    url: newProp.value,
                }]
            });
        }
    }

    uploadProp = {
        action:"/upload",
        listType: 'picture',
        beforeUpload: (file) => {
            let reader = new FileReader();

            let oldFileUrl = this.state.fileList[0]?this.state.fileList[0].url:"";//上一次上传图片的base64

            if(file){
                if(this.props.maxSize&&file.size>this.props.maxSize){//最大支持的文件大小，单位：字节
                    message.destroy();
                    message.error("文件过大");//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    return false;
                }
                this.name = file.name;
                this.uid = file.uid;
            }


            reader.onloadstart = () => {
                this.props.onChange({target:{value:""}});
            }

            reader.onload = () => {
                if(reader.result.indexOf("data:image/")<0){
                    message.destroy();
                    message.error("素材格式错误");//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                }
                else{
                    this.props.onChange({target:{value:reader.result}});//模拟从event中获取value，通过这种方式将value传给form
                }
            }

            reader.onerror = () => {
                this.props.onChange({target:{value:oldFileUrl}});
            }

            reader.readAsDataURL(file);
            return false;
        },
        onRemove:(file) => {
            this.props.onChange({target:{value:""}});
        }
    };

    render(){
        return (
            <div>
                <Upload {...this.uploadProp} accept={'image/*'} fileList = {this.state.fileList}>
                    <Button type="ghost">
                        <i className={'fa fa-upload'}/>
                        点击上传
                    </Button>
                </Upload>
            </div>
        )
    }
}
