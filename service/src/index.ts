import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
require("./utils/datePrototype");
const { oauth, tool, db, log, fs, path } = require("../tool/require");
const AlipaySDK = require('alipay-sdk').default;
const AlipayFormData = require('alipay-sdk/lib/form').default;
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const moment = require('moment');
const app = express()
const router = express.Router()
app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// 添加 body-parser 中间件
app.use(bodyParser.json());
app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// 使用 async/await 获取连接对象

const transporter = nodemailer.createTransport({
	service: "Gmail",
	port: 465,
	secure: true, // true for 465, false for other ports
	logger: true,
	debug: true,
	secureConnection: false,
	auth: {
		user: 'carlgg889900@gmail.com',
		pass: 'lajhczlqtvdvoafs'
	},
});
let codes = {}

// 支付宝配置
// const alipaySDK = new AlipaySDK({
// 	appId: '2021000122655256',
// 	signType: 'RSA2',
// 	privateKey: 'MIIEogIBAAKCAQEAnGO66zee+FFB9ewN5XrdVmFAuIEDvsuqe4xG9JHTloJG78WIEhsIUJ1pfiNw4I7xFHRtvFl02XhOL7cpQx+E4EN5VXprChihnvt7yEnpohV6rs3vM7myxE1B4u3SYJF/+iZaW366f0EaN/6TVbyXTByj+SHkKv/JXqXynh1v7PgWQXIpJmMhAmiOGAh1LxJQbd5wNHEkyDvRjaDxEz6SIHSOHY+cZP9Cpse7nmK7fM3CcpAG+F4aJ2euEXXgCGfO+idQPv2uKkDOMrxBirsthK3/S/NzpeFc5zrhTwPPrQhh0HglAF7fphTrs2tCQnZlkbTwLn+vjXqv6H/vsTFuJwIDAQABAoIBAGSQoR8mmjw2DIN2cw0xL+mfCj5bACyNzSg7cVlN+NDdH36J+FEkPvmP78lkQu60HIS5xeMLZ198xFJcptT6DLklyn1UBkbsxel08AlAtlM7GrQTyxDpBfLDd23U3qaoibIzPYF+gbDZDWIae2XzqxsPg8XtrEqWR0hs0BIq/dFUSZzbNeQEj97s/f7004MQ9Q1wfjajMws1gn+gtxTXmbo3MiW4CozJm/H0GwNGJ0/Q+v1V6yUJUQsCbO9eNSomKTQXZFyMk9eowsu7giDT8HqPVdN7w7fFvb+lzUfRgkD69lfj3Mmegn9GBBwTSgrM1mTmkPGuK1MFZPrXu6GTZakCgYEAzKeRwmqEe0aqcP9MKNH945nkiKFr1rz9jdr/VBc/DeC7C+OtPeETKOErfA31BsJtM1XWwn4mpJUbdCST8+UfyMLAq5XS+mGupHOshv6ouVakONErmLtHyVGz+QO7/SUzLj6Eo2IErlasVlZFygF4F7YX779JdCBv+mF+QLCRGGMCgYEAw6A5vcfmkb0x/gs28+/bPp3RdlmQqDfdETemj0bbVtMTWvFGIUddMsiUm1FqiZ36E43HHuHbn6dtpIqFvm5B8pT4RAoObD+B0E00Rimm11mZlovggSSzQzvL30zJz7WDHS+wHHAWMX5l7sAZNFoZqaoKASTGB2unCB2XKdP9hG0CgYAuapMUlTQXAaAGoOCVIYuD45OBqZrbyWF4mwLt/5e9fgruV2Ujc7j0vJ0wNbotHkvGKOHcmuAI1Ai1/tXPq1faINGyGPkQ8La7dcDbnUaHQq9cc5R/v3o4nt9CyyYH9Df3dRaAN+r335CWxFpvxoWGWzZymd//BpxfHV2VLna6IQKBgCzUzEbEx/9AN3O7yDUxE7KO4lDYB8G1Q7FNaptNJrkIGFhwEJ1RyHb55qyNhPfSv1u50xcttXIqIYNix3GzvONF5ntZPqLqDurYtpEZvIV/oCYTGjkeWwKecoNTCrDSLSEEK7zopv1itSN43I3V1CnAsRhAAC31Kss+VMUeMuwlAoGAfu6Whel/HtD+FjFZrMptbqkRHOs76UM+1rAXf7NfntmWb3+0sGtPtQC/Isdu064aNIGCtPmtnLVeKrfnBHcZVex2TnuSNMYjd6R2XjZB1V/e/NwDIQovMEAa63/VKNBWrJtNfFmGBNPsx3rSPO4ecR6sg32LMceeO1UfTeu+0to=',
//  	alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlPLUOkdrrxpEyT+GuRQUM7snVb5iRdEl3Avb6qUQnydLNIwU68vQQUmcILz2RkRrsqGLjkBsC9ugARM/dZ4ZlZ//awqAUDbCY9RRsbNL3iDcg5/PIqIzbdyQibajmIQZ5LVocoNmDDHlGkdKqvdai03b5oSUVIgrt9RdQYFhFyDxE1ihLBZ/hoOSKYZoif1E/OhAEwb74/rgn0jnNRt0nK7qZ3tDZ6lTqfezxpqGNlrzbZKa5R5kL9Q5F4RCZHKePjwjJp4w15EzBhTXkY3TvA6XNSRTeS6U/JQdkJ4TLhWpt8CARpZiIC7LaJpQI2EBq/hH+Jwz+80Ub7o1Z+ePgQIDAQAB',
// 	gateway: 'https://openapi.alipaydev.com/gateway.do', // 沙箱环境网关
// 	sandbox: true, // 设置为沙箱环境
// });
router.post('/send-code', (req, res) => {
	console.log(req)
	const email = req.body.email
	if (!email) {
		return res.send(tool.toJson(null, 'Email address required！', 1))
	}

	const code = randomstring.generate({ length: 6, charset: 'numeric' })
	codes[email] = code
	const mailOptions = {
		from: '启航 ✔ <carlgg889900@gmail.com>',
		to: email,
		subject: '启航验证码',
		html: `尊敬的用户，您当前正在进行登录操作，验证码是 <b> ${code} </b>，有效期为5分钟`
	}

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			// console.error(error)
		 	res.send(tool.toJson(error, '邮件发送失败！', 1))
		} else {
			// console.log(`Email sent: ${info.response}`)
		 	res.send(tool.toJson(info.response, '邮件发送成功！', 0))
		}
	})
})
router.post('/verifyCode',async (req, res) => {
	debugger
	const email = req.body.email
	const code = req.body.code
	if (!email || !code) {
	 	res.send(tool.toJson(null, '邮件地址和验证码为必填', 1));
	}
	let emailList,resq
	// if (codes[email] == code) {
	try{
		emailList = await db.query(`SELECT COUNT(*) as count FROM users WHERE email = "${email}"`);
	}catch(err){
		res.send(tool.toJson(null, '数据出错', 1002));
		return;
	}
	console.log(emailList)
			const count = emailList[0].count;
			var exists = false
			if (count > 0) {
				resq = await db.query(`SELECT users.id,users.email  FROM users WHERE users.email = "${email}"`);
				let token = await tool.token.setToken(JSON.stringify(resq[0].id));
				res.send(tool.toJson({token:token,user:email}, '登录成功', 0))
			} else {
				const date = new Date().Format('yyyy-MM-dd hh:mm:ss');
				try{
					resq = await db.query(`INSERT INTO users (name, email, created_at, status) VALUES ("${email}", "${email}", "${date}", 1)`);
					await db.query(`INSERT INTO user_times (user_id, free_total_times,free_remaining_times,card_remaining_times) VALUES ("${resq.insertId}", 5, 5, 5)`);
					console.log(resq.insertId)
					let token = await tool.token.setToken(resq.insertId);
					res.send(tool.toJson({token:token,user:email}, '登录成功', 0))
				}catch(err){
					res.send(tool.toJson(null, '数据出错', 1002));
					return;
				}
			}

	// } else {
	//  	res.send(tool.toJson('2222', '请输入正确的验证码', 1))
	// }
})

router.post('/chat-process', oauth(1001), async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', oauth(1001), async (req, res) => {
  try {
    const response = await chatConfig()
		res.send(tool.toJson(response, '登录成功', 0))
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
		if(req.body.token){
			let token = await tool.token.getUser(req.body.token);
			res.send(tool.toJson({ auth:token? true:false, model: currentModel() },'', 0))
		}else{
			res.send(tool.toJson({ auth:false, model: currentModel() },'', 1003))
		}

  }
  catch (error) {
    res.send(tool.toJson(null,error.message, 1))
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

// // 支付宝配置
const alipaySDK = new AlipaySDK({
	appId: '2021003186683592',
	signType: 'RSA2',
	privateKey: 'MIIEowIBAAKCAQEA6Z3gF7nnxIfpHSG3w0uQw+oHnd1vAMlCtl41BYlG/seDwPfCLlW/3IGEDjxEapUvNOVOy0SdANp5q9xzE41QSW6cvVkhi1Tcdt5k/Stn503nARb8P6+y/Qp4xii0jVmrIUqmvGey6mEDsHGfIZp76ieEv9uuvEclEoTEHAIBmwMTTreWoKN+eaLDq31BIk3WlCjIPSAABdtyxSpQfm9BFBvpifg3VD4aSWCBc+2CNSbVRuSfCUlfsre1raRs+rn3TenjzhlnBlGXl17HBNt94VRArmPWuR4aT2OD304naZczPaWuDMUfzSUPCNDDADVzdnd+YBWsIolK28ZwmSANmQIDAQABAoIBAHaYlQi2cbhNnsQRN+7Gz8kFZ7R2k0F86ocWMCiNViNFOdeeb0+CbJIOlfF8GudYsMxTlLqQLHwgbSAYG7tTQ+zjYGKneuX2wKz/nZkAjhDYdWsSNiBGm8DlrgY6593SJZQTB64hnqxpb6wFIlm2yS1HvpZ/eadPHrzV9ZCaXCJKZvT1SBrknmId7V4KPmSYEU2Rxjl2wtfU7ZJKiFVucvqKOR8QJQTkOBiGd4RiN0S+mKrXU66xllwC7UAecjGHXDYiGi8vZjbRh0emjGVWm9gS6qKUkYgrrp7He7h6JX5wKc1df6mgfFGUJcd/GGXiKN750Fy+dLPsh4oQB2JCVfkCgYEA/Ngsrd1l7GbIRE8xced0uFPer1HFaw5EDAozmNQB+5zRZnk9trwd7Hfu96aTOd7H9qoiGfodk8uk9OkaccEkmviAwyBr9STvFLoK4ARf8v3mXRg7+PjwuXPR8ztw7yZHBxm1ar9317/INssdiP3a1hCOOEAcXXtru7doLGf8AwcCgYEA7IhE6SlTwIcxmsTedzJtOZnBErktZZBQ5HN26569idkgaNzrKZdFDzQFzEMBZaGQPicvpA2Tgwmkmj2MAqSKxl6QmT5DO6G0xBM44OSqn9/CwVV/C57N1ftM6OXO3KGDaq+V+1FdDku/P5kPLZkSZxibFhc96q5uZygA35MsIl8CgYA2Guw0qFPPKo9gTrH99dF8QDY+vfjI19yn1ucDpRpnhT8p9nfGSqr8lw2D4RlQIOQZXH6/oE4D+mfqIJeQEAyNPPAQ0TdI1gZzIPyCw2zkyoApG655sIuSo74hlm6sPjykwFOZ7C7w9BEb6IsBbZEOjaxhTRbEykxbdvvLxNSgsQKBgQDlvlZwwpt+3dHoqmALFwfQcu996C+X/t0TiLNxmPYw9pzsPeiMtUl2wuj+xfaNaKhaNmWnyygEl1EyH6XmyzugAiohLsDPIvoZmTId/v1b3FOmxgxolQ8JUNYbQVv0IU0sSvA684SXZiuU8m4ztAKT8OpyQpD5agQCXnC6uJCdsQKBgG+Z9LCmlalYYrRNiydfCpsnpBeSi+ksFdK5sW1IQZH6JfvXnCF9Y7KT+CfkOtxp2SJDA4IyqGbmg3TE22t+RL4trLojfpG0Lj/9lVOmSUCztNEdTbXzAAd+SiE/CauUAzfIwf6A2bYHSWPsPUd12y9Tc88n5QMu2if4g+lWv8PV',
	alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApV2Q2IMVgqCxgjo/OWIRRXn5XmrYJXQK8AifFpyIJxdUeCut/Fn7gu1NFM/VIjf9IfXQ1cClouPR/Fso7SK4ZDgXLIkJCo76iDnZGp07QnJzzBUtnuQgj9F8eTS71JaWuC4Wg7TLHcVzRxt6HgB+frZhxlS/HUIAhHJ//qnnnj2OAZs+EdHu6G/5VwOAmpW6wx6ifDJWIEcYHd63N6TnxLw524EoLMSnpWQFaGj2yoOJEixVf697ukvG0PcC7reqF/Oa+ufbMxBe/M5TNgRoIj6VY02knO3Q+og3eNXwD64iGOUsMhINVtN3i7Wo9al7aeLo3UubpEvaQss43iQmGwIDAQAB',
	gateway: 'https://openapi.alipay.com/gateway.do' // 沙箱环境网关
});
// 创建付款记录
router.post('/payments', async (req, res) => {
	let user_id = await tool.token.getUser(req.headers.Authorization);
	const { amount, subject, body } = req.body;
	const plan = req.body.plan || 1;
	// const start_date = today.Format('yyyy-MM-dd hh:mm:ss');
	let start_time =moment(new Date());
	let end_time = '';
	switch (plan) {
		case 1:
			end_time = start_time.add(1, 'month');
			break;
		case 2:
			end_time = start_time.add(3, 'month');
			break;
		case 3:
			end_time = start_time.add(1, 'year');
			break;
	}
	const outTradeNo = Date.now().toString();
	start_time =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	end_time = moment(end_time).format('YYYY-MM-DD HH:mm:ss');
	// 构造请求参数
	const formData = new AlipayFormData();
	formData.setMethod('get');
	formData.addField('returnUrl', 'https://chat.sharexcloud.top/api/return');
	formData.addField('notifyUrl', 'https://chat.sharexcloud.top/api/payments_callback');
	formData.addField('bizContent', {
		outTradeNo,
		productCode: 'FACE_TO_FACE_PAYMENT',
		totalAmount: amount,
		subject,
		body:'cccc',
	});

	try {
		const result = await alipaySDK.exec(
			'alipay.trade.precreate',
			{},
			{ formData: formData },
		);
		console.log(result.qr_code,result)
		const qrCodeUrl = result.qr_code;
		// 生成订单
		const order = {
			outTradeNo,
			amount,
			subject,
			body,
			start_time: start_time,
			status: 'created', // 订单状态：created、paid、cancelled
			qrcodeUrl: result // 支付二维码链接
		};
		let result1
		// TODO: 将订单信息保存到数据库中
		try {
			result1 = await db.query(
				`INSERT INTO payments (user_id, amount, plan, start_date, end_date) VALUES (95, ${amount}, ${plan}, "${start_time}", "${end_time}")`
			);
			var temp = {
				outTradeNo,
				amount,
				subject,
				body,
				start_time,
				status: 'created', // 订单状态：created、paid、cancelled
				qrcodeUrl: result, // 支付二维码链接
				id: result1.insertId,
				user_id,
				end_time,
				create_time: start_time,
				update_time: start_time,
			}
			res.send(tool.toJson(temp, '生成订单成功', 0))
		} catch (error) {
			console.error(error);
		}

	} catch (error) {
		res.status(500).json({ success: false, message: '支付请求失败' });
	}
});
// 支付回调处理
router.post('/payments_callback',oauth(1001), async (req, res) => {
	const payment_id = req.body.outTradeNo;
	const status = req.body.status;
	try {
		debugger
		const formData = new AlipayFormData();
		formData.setMethod('get');
		formData.addField('bizContent', {
			outTradeNo:req.body.outTradeNo,
		});
		const result = await alipaySDK.exec(
			'alipay.trade.query',
			{},
			{ formData: formData },
		);
		console.log(result)
		res.send(tool.toJson(result, '查询订单成功', 0))
		// TODO: 更新订单状态
	} catch (error) {
		console.error(error);
		res.sendStatus(500); // 返回失败响应
	}
});
//return
router.post('/return', async (req, res) => {
	const payment_id = req.body.id;
	const status = req.body.status;
	console.log(req.body)
	try {
		const payment = await db.query(
			`SELECT * FROM payments WHERE id = "${payment_id}" AND status ="no"`
		);
		if (!payment) {
			return res.status(400).send('Invalid payment ID or status');
		}

		await db.query(
			`UPDATE payments SET status = 3 WHERE id = ${payment_id}`);
		res.send(tool.toJson(null, '订单更新成功', 0))
		// if (status === 'completed') {
		// 	const user_id = payment.user_id;
		// 	const plan = payment.plan;
		// 	switch (plan) {
		// 		case 'monthly':
		// 			await db.execute(
		// 				'UPDATE users SET membership_type = ? WHERE id = ?',
		// 				['monthly', user_id],
		// 			);
		// 			break;
		// 		case 'quarterly':
		// 			await db.execute(
		// 				'UPDATE users SET membership_type = ? WHERE id = ?',
		// 				['quarterly', user_id],
		// 			);
		// 			break;
		// 		case 'yearly':
		// 			await db.execute(
		// 				'UPDATE users SET membership_type = ? WHERE id = ?',
		// 				['yearly', user_id],
		// 			);
		// 			break;
		// 	}
		// }
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});
// routeEach(app);
app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
