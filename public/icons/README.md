# 支付图标资源

此文件夹包含支付方式的图标资源。

## 需要的图标文件

### 1. 支付宝图标
- **文件名**: `alipay.png`
- **尺寸**: 120x120 px (推荐)
- **格式**: PNG (透明背景)
- **颜色**: 支付宝品牌色 (#1677FF)
- **获取方式**: 
  - 从支付宝官方品牌资源下载: https://opendocs.alipay.com/multi/028xqh
  - 或使用项目提供的图标

### 2. 微信支付图标
- **文件名**: `wechat-pay.png`
- **尺寸**: 120x120 px (推荐)
- **格式**: PNG (透明背景)
- **颜色**: 微信品牌色 (#07C160)
- **获取方式**: 
  - 从微信支付官方品牌资源下载: https://pay.weixin.qq.com/static/paym/app/brand-download.html
  - 或使用项目提供的图标

### 3. PayPal 图标
- **文件名**: `paypal.png`
- **尺寸**: 120x120 px (推荐)
- **格式**: PNG (透明背景)
- **颜色**: PayPal 品牌色 (#003087)
- **获取方式**: 
  - 从 PayPal 官方品牌资源下载: https://www.paypal.com/brand/brand-download
  - 或使用项目提供的图标

## 临时解决方案（测试用）

如果暂时没有官方图标，可以：

### 方案 1: 使用文本代替
在支付页面中，暂时不显示图标，只用文字：

```tsx
// src/app/payment/[orderId]/page.tsx

{/* 支付宝 */}
<div className="flex flex-1 items-center space-x-3">
  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold">
    Alipay
  </div>
  <div>
    <p className="font-medium">支付宝</p>
    <p className="text-sm text-gray-500">推荐有支付宝账户的用户使用</p>
  </div>
</div>
```

### 方案 2: 使用 Emoji 代替
```tsx
<div className="flex h-12 w-12 items-center justify-center text-4xl">
  💰
</div>
```

### 方案 3: 使用在线图标
```tsx
// 使用 DiceBear Avatars (免费)
<div className="relative h-12 w-12">
  <Image
    src="https://api.dicebear.com/7.x/avataaars/svg?seed=alipay"
    alt="支付宝"
    fill
    className="object-contain"
  />
</div>
```

## 添加真实图标后的效果

支付页面会显示：

1. 支付宝 - 蓝色图标
2. 微信支付 - 绿色图标
3. PayPal - 蓝色/黄色图标

图标会显示在支付方式选择卡片的左侧，帮助用户快速识别支付方式。

## 注意事项

1. **版权**: 使用官方图标时，请遵守品牌使用规范
2. **尺寸**: 推荐使用 120x120 px，在页面中会显示为 48x48 px (h-12 w-12)
3. **格式**: PNG 格式支持透明背景，效果更好
4. **优化**: 使用 TinyPNG (https://tinypng.com/) 压缩图标文件大小

---

**当前状态**: ⚠️ 图标文件缺失

**解决方案**: 
1. 下载官方图标并放置到此文件夹
2. 或暂时使用文本/Emoji 代替
3. 或注释掉图标显示代码

**更新时间**: 2026年6月14日 22:01
