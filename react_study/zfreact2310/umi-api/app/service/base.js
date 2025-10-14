const { Service } = require('egg');
class BaseService extends Service {
  async list(pageNum, pageSize, where) {
    let query = {
      where,
      order: [[ 'id', 'asc' ], [ 'username', 'asc' ]]
    };
    if(pageSize){
      query.limit=pageSize;
      query.offset=(pageNum - 1) * pageSize
    }
    const list = await this.app.mysql.select(this.entity, query);
    const total = await this.app.mysql.count(this.entity, where);
    return { list, total };
  }
  async create(entity) {
    const result = await this.app.mysql.insert(this.entity, entity);
    return result.affectedRows > 0;
  }
  async update(entity) {
    // update user set username=?,password=? where id = ?
    const result = await this.app.mysql.update(this.entity, entity);
    return result.affectedRows > 0;
  }
  async show(id) {
    const result = await this.app.mysql.get(this.entity,  { id });
    return result;
  }
  async destroy(ids) {
    // delete user where id = ?id
    const result = await this.app.mysql.delete(this.entity, { id: ids });
    return result.affectedRows > 0;
  }
}
module.exports = BaseService;
