import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{maxWidth: 960, margin: '0 auto', padding: '24px 16px'}}>
      <h1 style={{fontSize: 24, marginBottom: 16}}>中文AI聊天公益平台</h1>
      <p style={{color: '#64748b'}}>这是前端应用的起始页。请前往聊天页体验。</p>
      <ul style={{marginTop: 16, lineHeight: 2}}>
        <li>➡️ <Link href="/chat">前往聊天页</Link></li>
        <li>📄 <a href="https://github.com/" target="_blank" rel="noreferrer">查看项目文档（docs/）</a></li>
      </ul>
    </main>
  )
}

