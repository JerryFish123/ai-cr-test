# prdemotest · Vue3 后台管理演示

Vue 3 + Vite + Vue Router + Pinia。  
**暂无真实后端**，账号/会员/产品数据保存在浏览器 `localStorage`。

## 功能

- 登录 / 注册
- 会员管理：新增、删除、修改余额
- 产品管理：新建/编辑、上架/下架、删除
- Banner 管理：本地上传图片、启用/停用、排序
- 商家管理：商家增删改/停用；商家下 SKU 增删改与上架
- 概览统计

PRD 见 `doc/PRD-0723迭代.pdf`（第 3、4 章对应 Banner / 商家）。

## 启动

```bash
cd prdemotest
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`）。

## 演示账号

- 用户名：`admin`
- 密码：`admin123`

也可在注册页自行创建管理员账号。
