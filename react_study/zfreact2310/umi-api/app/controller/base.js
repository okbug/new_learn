const { Controller } = require('egg');
const ErrorShowType = {
  SILENT: 0,
  WARN_MESSAGE: 1,
  ERROR_MESSAGE: 2,
  NOTIFICATION: 3,
}
class BaseController extends Controller {
  async index() {
    // this.error(ErrorShowType.NOTIFICATION,100,'请求用户列表失败');
    const { ctx, service } = this;
    const { pageNum, pageSize, ...where } = ctx.query;// 从查询字符串获得参数
    const list = await service[this.entity].list(isNaN(pageNum) ? 0 : parseInt(pageNum),
      isNaN(pageSize) ? 0 : parseInt(pageSize), where);
    this.success(list);
    list ? this.success(list) : this.error(ErrorShowType.ERROR_MESSAGE, 'E00001', '查询失败');
  }
  async create() {
    const { ctx, service } = this;
    const entity = ctx.request.body;
    const result = await service[this.entity].create(entity);
    result ? this.success('创建成功') : this.error(ErrorShowType.ERROR_MESSAGE, 'E00002', '创建失败');
  }
  async update() { // /api/user/1  请求体是更新后的数据
    const { ctx, service } = this;
    const id = ctx.params.id;
    const entity = ctx.request.body;
    entity.id = id;
    const result = await service[this.entity].update(entity);
    result ? this.success('更新成功') : this.error(ErrorShowType.WARN_MESSAGE, 'E00003', '更新失败');
  }
  async show() { // /api/user/1
    const { ctx, service } = this;
    const id = ctx.params.id;
    const result = await service[this.entity].show(id);
    result ? this.success(result) : this.error(ErrorShowType.WARN_MESSAGE, 'E00004', '查找失败');
  }
  async destroy() {
    const { ctx, service } = this;
    const id = ctx.params.id;
    let ids = ctx.request.body;
    if (!ids || Object.keys(ids).length === 0) {
      ids = [id];
    }
    const result = await service[this.entity].destroy(ids);
    result ? this.success('删除成功') : this.error(ErrorShowType.WARN_MESSAGE, 'E00005', '删除失败');
  }

  success(data) {
    this.ctx.body = {
      success: true,
      data,
    };
  }
  error(showType, errorCode, errorMessage) {
    this.ctx.body = {
      success: false,
      showType,
      errorCode,
      errorMessage
    };
  }
}
module.exports = BaseController;
