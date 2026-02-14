## ADDED Requirements

### Requirement: 登录认证

系统 MUST 提供基于用户名密码的登录端点。凭据从服务端配置文件读取，仅支持单用户。

#### Scenario: 登录成功
- **WHEN** 客户端发送 `POST /api/auth/login` 且 body 包含正确的 `{ username, password }`
- **THEN** 服务端设置 signed cookie 并返回成功状态

#### Scenario: 登录失败
- **WHEN** 客户端发送 `POST /api/auth/login` 且用户名或密码错误
- **THEN** 服务端返回 401 状态码，不设置 cookie

#### Scenario: 登出
- **WHEN** 客户端发送 `POST /api/auth/logout`
- **THEN** 服务端清除 session cookie

### Requirement: API 端点保护

所有 `/api/*` 路由（除 `/api/auth/login`）MUST 受鉴权中间件保护。未认证的请求 MUST 被拒绝。

#### Scenario: 未认证访问 API
- **WHEN** 客户端未携带有效 session cookie 访问 `/api/site/posts`
- **THEN** 服务端返回 401 状态码

#### Scenario: 已认证访问 API
- **WHEN** 客户端携带有效 session cookie 访问 `/api/site/posts`
- **THEN** 服务端正常处理请求并返回数据

### Requirement: 前端登录页面

Web 模式 MUST 提供 `/login` 路由页面，包含用户名和密码输入框。

#### Scenario: 未登录重定向
- **WHEN** 用户在 Web 模式下未登录访问任何页面
- **THEN** 前端路由重定向到 `/login` 页面

#### Scenario: 登录成功跳转
- **WHEN** 用户在登录页面输入正确凭据并提交
- **THEN** 前端调用登录 API，成功后跳转到首页（Dashboard）

#### Scenario: 登录失败提示
- **WHEN** 用户在登录页面输入错误凭据并提交
- **THEN** 页面显示错误提示信息，不跳转

### Requirement: Session 管理

鉴权 MUST 使用 signed cookie 管理 session。Cookie MUST 设置 `httpOnly` 和 `sameSite` 属性。

#### Scenario: Cookie 属性
- **WHEN** 登录成功设置 cookie
- **THEN** cookie MUST 包含 `httpOnly: true`、`sameSite: 'strict'` 属性

#### Scenario: Session 过期
- **WHEN** 用户的 session cookie 过期或无效
- **THEN** API 请求返回 401，前端重定向到登录页面

### Requirement: 认证状态检查

系统 MUST 提供认证状态检查端点，供前端判断当前是否已登录。

#### Scenario: 检查已登录状态
- **WHEN** 客户端发送 `GET /api/auth/check` 且携带有效 session cookie
- **THEN** 返回 `{ authenticated: true }`

#### Scenario: 检查未登录状态
- **WHEN** 客户端发送 `GET /api/auth/check` 且未携带有效 cookie
- **THEN** 返回 `{ authenticated: false }`
