import { axios } from './methods';
import {
  service,
  getVehicleInfoUrl
} from './service';
import { notification, message } from 'antd'

// 统一导出供调用  请勿重复命名

const request = {
  // 用户端
  register: (params: any) => { return axios('post', service.register, params) }, // 车主注册
  login: (params: any) => { return axios('post', service.login, params) }, // 车主登录
  addVehicle: (params: any) => { return axios('post', service.addVehicle, params) }, // 添加用户车辆
  acceptOrder: (params: any) => { return axios('post', service.acceptOrder, params) }, // 车主接单
  completeOrder: (params: any) => { return axios('post', service.completeOrder, params) }, // 车主完成订单
  orderHistory: (params: any) => { return axios('get', service.orderHistory, params) }, // 订单历史
  recent7dayTurn: (params: any) => { return axios('get', service.recent7dayTurn, params) }, // 最近7日财务数据
  recent7MonTurn: (params: any) => { return axios('get', service.recent7MonTurn, params) }, // 最近7月财务数据
  getTurnoverDays: (params: any) => { return axios('get', service.recent7dayTurn, params) }, // 获取每日营业额数据
  getTurnoverMonths: (params: any) => { return axios('get', service.recent7MonTurn, params) }, // 获取月度收入数据
  uploadBankcard: (params: any) => { return axios('post', service.uploadBankcard, params) }, // 上传银行卡
  getVehicleInfo: (params: any) => { return axios('get', getVehicleInfoUrl(params.vehicleId)) }, // 获取车辆信息
  
  // 财务接口
  withdrawFinance: (params: any) => { return axios('post', service.withdrawFinance, params) }, // 提现
  getFinanceInfo: (params: any) => { return axios('get', service.getFinanceInfo, params) }, // 财务记录

  // 文件
  /** 
  * 上传文件 - 接口上传 post 
  * @param url {string} - 文件上传地址
  * @param params {Object} - 请求参数对象
  */
  upLoadFileNew: (url: any, params: any) => {
    // 判断params是否是FormData类型，如果是，传过来的就是多参数直接传给后台，如：
    /* const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 1)
      此时params = formData */
    if (params instanceof FormData) {
      return axios('upLoad', url, params)
    } else {
      const { file } = params
      const formData = new FormData()
      formData.append('file', file) //单个参数（只有文件）
      return axios('upLoad', url, formData)
    }
  },

  /** 
  * 下载文件 - 接口下载 post 
  * @param url {string} - 文件下载地址
  * @param fileName {string} - 文件名（默认需要添加文件后缀，不添加后缀请让后端在contentType中带上文件类型，参考下方fileExtensions对象）
  * @param params {Object} - 请求参数对象
  */
  // downloadFile: (url: any, fileName: string, params: any) => {
  //   message.loading("正在下载文件，请稍后")
  //   return axios('download', url, params).then(response => {
  //     let data = response.data;
  //     let contentType = response.headers['content-type'];
  //     // 处理后端返回的错误信息 如果是json的话
  //     if (data["type"] == "application/json") {
  //       const reader = new FileReader();
  //       reader.onload = function () {
  //         const { errCode, errMsg } = JSON.parse(reader.result);
  //         console.log(JSON.parse(reader.result));
  //         if (errCode && errCode != 0) {
  //           notification.error({
  //             message: '下载失败',
  //             description: errMsg,
  //           });
  //         } else {
  //           notification.error({
  //             message: '下载失败',
  //             description: '文件下载失败，请稍后重试',
  //           });
  //         }
  //       };
  //       reader.readAsText(data);
  //       return
  //     }
  //     // 后端若无返回 本地处理错误
  //     if (!data || data.size === 0) {
  //       notification.error({
  //         message: '下载失败',
  //         description: '文件下载失败，请稍后重试',
  //       });
  //       return;
  //     }

  //     // 文件类型和扩展名的映射
  //     const fileExtensions = {
  //       'xlsx': '.xlsx',
  //       'word': '.docx',
  //       'zip': '.zip',
  //       'pdf': '.pdf',
  //       'txt': '.txt'
  //       // ...添加更多的文件类型和扩展名
  //     };

  //     // 根据contentType获取扩展名
  //     function getExtensionFromContentType() {
  //       for (const fileType in fileExtensions) {
  //         if (contentType?.includes(fileType)) {
  //           return fileExtensions[fileType];
  //         }
  //       }
  //       return '';
  //     }

  //     const extension = getExtensionFromContentType();
  //     const fullFileName = fileName + extension;


  //     if (typeof window.navigator.msSaveBlob !== 'undefined') { //IE浏览器
  //       // Internet Explorer
  //       window.navigator.msSaveBlob(new Blob([data]), fullFileName);
  //     } else {
  //       // Other browsers
  //       const downloadUrl = window.URL.createObjectURL(new Blob([data]));

  //       const link = document.createElement('a');
  //       link.style.display = 'none';
  //       link.href = downloadUrl;
  //       link.setAttribute('download', fullFileName);
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       window.URL.revokeObjectURL(downloadUrl);
  //     }


  //     let percentCompleted = 0;
  //     const totalDuration = 6000; // 总共的加载时间（以毫秒为单位）

  //     // 创建通知
  //     const key = 'download-progress-notification';
  //     notification.open({
  //       key,
  //       message: '下载进度',
  //       description: `已完成 ${percentCompleted.toFixed(2)} %`,
  //     });

  //     const updateProgress = () => {
  //       if (percentCompleted < 100) {
  //         percentCompleted += (100 / totalDuration) * 100;
  //         // 更新通知内容
  //         notification.open({
  //           key,
  //           message: '下载进度',
  //           description: `已完成 ${Math.min(percentCompleted, 100).toFixed(2)} %`,
  //         });
  //       } else {
  //         clearInterval(progressInterval); // 当加载完成后停止定时器
  //         // 关闭通知
  //         setTimeout(() => {
  //           notification.close(key);
  //         }, 1000);
  //       }
  //     };

  //     const progressInterval = setInterval(updateProgress, totalDuration / 100);
  //   });
  // }
};

export default request;
