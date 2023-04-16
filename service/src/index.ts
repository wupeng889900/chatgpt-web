import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { oauth, tool, db, log, fs, path } from "./utils/tool/require";
require("./utils/datePrototype");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const jwt = require('jsonwebtoken');

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

router.post('/send-code', (req, res) => {
	console.log(req)
	const email = req.body.email
	if (!email) {
		return res.status(200).send(tool.toJson(null, 'Email address required！', 1))
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
		 	res.status(200).send(tool.toJson(error, '邮件发送失败！', 1))
		} else {
			// console.log(`Email sent: ${info.response}`)
		 	res.sendStatus(200).send(tool.toJson(info.response, '邮件发送成功！', 0))
		}
	})
})
router.post('/verifyCode',async (req, res) => {
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
				debugger
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

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
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

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
