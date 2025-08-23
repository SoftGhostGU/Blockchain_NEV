
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import './index.scss'
const GraphicCode = forwardRef((props, ref) => {
    let timeSecond = 30 //秒

    //将子组件的方法 暴露给父组件
    useImperativeHandle(ref, () => ({
        verify
    }))
    useEffect(() => {
        // 获取当前要显示验证码的canvas标签
        let code = document.querySelector('.code')
        // 生成验证码
        getCode(code, 4)

        let setIntervalFun = null;
        function setTime() {
            getCode(code, 4)
        }
        setIntervalFun = setInterval(setTime, 1000 * timeSecond);
    }, []);


    // 点击code
    const onCode = () => {
        // 获取当前要显示验证码的canvas标签
        let code = document.querySelector('.code')
        // 重新生成验证码
        flush(code)
    }

    // 获取随机颜色
    function getColor() {
        return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`
    }
    // 获取随机数
    function getRandom(a: any, b = 0) {
        let max = a;
        let min = b;
        if (a < b) {
            max = b;
            min = a;
        }
        return Math.floor(Math.random() * (max - min)) + min
    }
    // 设置cookie
    function setCookie(key: any, value: any, seconds: any, path = "/") {
        // 秒
        let date = new Date()
        date.setTime(date.getTime() - 8 * 3600 * 1000 + seconds * 1000)
        document.cookie = `${key}=${value};expires=${date};path=${path}`
    }
    // 获取cookie
    function getCookie(key: any, path = "/") {
        let cookiesArr = document.cookie.split('; ')
        for (let i = 0; i < cookiesArr.length; i++) {
            let brr = cookiesArr[i].split('=')
            if (brr[0] === key) {
                return brr[1]
            }
        }
    }
    // 设置验证码 - 参数为canvas标签的节点对象
    function getCode(ele: any, num = 4) {
        // 定义工具箱
        let ctx = ele.getContext('2d')
        // 随机点
        // 获取画布宽和高
        let width = ctx.canvas.width
        let height = ctx.canvas.height
        // 设置线段宽度
        ctx.lineWidth = 2
        // 循环创建点
        for (let i = 0; i < 1000; i++) {
            // 开启路径
            ctx.beginPath()
            // 设置随机点的开始位置
            let x = getRandom(width - 2)
            let y = getRandom(height - 2)
            // 画点 - 将画笔放到开始位置
            ctx.moveTo(x, y)
            // 将画笔移动到1px后
            ctx.lineTo(x + 1, y + 1)
            // 填充颜色
            ctx.strokeStyle = getColor()
            ctx.stroke()
        }
        // 随机线
        for (let i = 0; i < 20; i++) {
            // 开启路径
            ctx.beginPath()
            // 设置随机的开始位置
            let x = getRandom(width - 2)
            let y = getRandom(height - 2)
            // 设置随机的宽和高
            let w = getRandom(width - x)
            let h = getRandom(height - y)
            // 将画笔放到开始位置
            ctx.moveTo(x, y)
            // 将画笔移动到 开始位置+随机宽
            ctx.lineTo(x + w, y + h)
            // 填充随机颜色
            ctx.strokeStyle = getColor()
            ctx.stroke()
        }
        // 随机字符
        // 字符容器
        let strContainer = 'abcdefghijkmnpqrstuvwxyz2345678ABCDEFGHJKLMNPQRSTUVWXYZ'
        // 设置文字大小
        ctx.font = width / 5 + "px 微软雅黑"
        // 设置文字垂直对齐方式
        ctx.textBaseline = 'middle';
        // 验证码字符串
        let str = '';
        // 遍历生成字符放在画布中
        for (let i = 0; i < num; i++) {
            // 开启路径
            ctx.beginPath()
            // 描边文字颜色
            ctx.fillStyle = "#000"
            // 随机字符
            let word = strContainer[getRandom(strContainer.length)]
            // 设置每个文字所处的区域大小
            let w = width / num;
            // 定义文字left和top
            let left = getRandom(i * w, (i + 1) * w - width / 5)
            let top = getRandom(height / 2 - 10, height / 2 + 10)
            // 写文字
            ctx.fillText(word, left, top);
            // 将所有字符存起来
            str += word
        }
        // 将验证码字符串存在cookie中
        setCookie('code', str, timeSecond)
    }
    // 刷新验证码 - 参数为canvas标签的节点对象
    function flush(ele: any) {
        // 重新获取工具箱
        let ctx = ele.getContext('2d')
        // 随机点
        // 获取画布大小
        let width = ctx.canvas.width
        let height = ctx.canvas.height
        // 将画布中内容清空
        ctx.clearRect(0, 0, width, height)
        // 重新生成验证码
        getCode(ele)
    }

    // 校验验证码 - 参数为被验证的字符串 - 返回布尔值
    function verify(str: any) {
        // 从cookie中获取验证码字符串
        let code = getCookie('code')
        if (code) {
            let codeWord = code.toLowerCase()
            // 对比
            if (str.toLowerCase() === codeWord) {
                return true
            } else {
                return false;
            }
        } else {
            getCode(document.querySelector('.code'))
        }

    }
    return (
        <>
            <div className="GraphicCode">
                <canvas className="code" width={150} height={50} onClick={onCode}></canvas>
            </div>
        </>
    )
})

export default GraphicCode