/**
 * 图片转换为base64保存在表单中，目前仅支持单文件
 * props:maxSize:最大大小,单位：字节
 */
import React, { Component, PropTypes } from 'react';
import {Upload,Button,message} from 'antd';

export default class ImageBase64 extends Component {

    static propTypes = {
        maxSize: React.PropTypes.number,//单位：字节
        maxHeight:React.PropTypes.number,//单位：像素
        maxWidth:React.PropTypes.number,
        minHeight:React.PropTypes.number,
        minWidth:React.PropTypes.number,
        exactHeight:React.PropTypes.number,
        exactWidth:React.PropTypes.number,
        ratio:React.PropTypes.number,//长宽比
    }

    name="图片";
    uid=-1;

    constructor(props) {
        super(props);

        if(props.value){
            this.state = {
                fileList:[{
                    uid: this.uid,
                    name: this.name,
                    status: 'done',
                    url: props.value,
                }],
            };
        }
        else{
            this.state = {
                fileList:[],
            }
        }
    }

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
                if(file.type=="image/gif"){
                    message.destroy();
                    message.error("不支持gif");//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    return false;
                }
            }

            reader.onloadstart = () => {
                this.props.onChange({target:{value:""}});
            }

            reader.onload = () => {
                var image = new Image();
                image.src = reader.result;

                var isImageValid = true;

                if(this.props.ratio&&(image.width/image.height)!= this.props.ratio){
                    message.destroy();
                    message.error("长宽比错误，应为"+this.props.ratio);//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    isImageValid = false;
                }

                if(this.props.minHeight>image.height){
                    message.destroy();
                    message.error("尺寸错误：高度不得小于"+this.props.minHeight);//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    isImageValid = false;
                }
                if(this.props.maxHeight<image.height){
                    message.destroy();
                    message.error("尺寸错误：高度不得大于"+this.props.maxHeight);//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    isImageValid = false;
                }

                if(this.props.minWidth>image.width){
                    message.destroy();
                    message.error("尺寸错误：宽度不得小于"+this.props.minWidth);//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    isImageValid = false;
                }
                if(this.props.maxWidth<image.width){
                    message.destroy();
                    message.error("尺寸错误：宽度不得大于"+this.props.minWidth);//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    isImageValid = false;
                }

                if(this.props.exactHeight&&this.props.exactHeight!=image.height){
                    message.destroy();
                    message.error("尺寸错误：高度为"+this.props.exactHeight);//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    isImageValid = false;
                }
                if(this.props.exactWidth&&this.props.exactWidth!=image.width){
                    message.destroy();
                    message.error("尺寸错误：宽度为"+this.props.exactWidth);//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    isImageValid = false;
                }

                if(reader.result.indexOf("data:image/")<0){
                    message.destroy();
                    message.error("素材格式错误");//TODO 用antd原生的错误提示
                    this.props.onChange({target:{value:oldFileUrl}});
                    isImageValid = false;
                }

                if(isImageValid){
                    this.name = file.name;
                    this.uid = file.uid;
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
