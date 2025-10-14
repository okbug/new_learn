const BaseController = require('./base');
const { sign } = require('jsonwebtoken');
class Controller extends BaseController {
  constructor(...args) {
    super(...args);
    this.entity = 'user';
  }
  async signin() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;// {username,password}
    // select * from user where username=? and password=?
    const result = await app.mysql.select('user', {
      where: { username, password },
      limit: 1,
    });
    if (result && result.length > 0) {
      const user = JSON.parse(JSON.stringify(result[0]));
      delete user.password;
      this.success(sign(user, this.config.jwtSecret));
    } else {
      this.error('登录失败');
    }
  }
  async signup() {
    const { ctx, app } = this;
    const user = ctx.request.body;// {username,password,email}
    const result = await app.mysql.insert('user', user);
    if (result.affectedRows > 0) {
      this.success({
        id: result.insertId,
      });
    } else {
      this.error('注册失败');
    }
  }
}
module.exports = Controller;
