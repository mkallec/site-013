import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Clapperboard, Flame, Grid3X3, Home, Mail, Menu, Newspaper, Search, ShieldCheck, Sparkles, Star, Trophy, Tv, X } from "lucide-react";
import { channels, movies } from "./data/catalog";
import "./styles.css";

const nav = [
  ["首页", "home", Home],
  ["全部影片", "library", Clapperboard],
  ["分类频道", "channels", Grid3X3],
  ["热播榜", "rank", Trophy],
  ["搜索", "search", Search],
  ["服务支持", "service", ShieldCheck]
];

function App() {
  const [page, setPage] = useState("home");
  const [keyword, setKeyword] = useState("");
  const [channel, setChannel] = useState("全部");
  const [active, setActive] = useState(null);
  const [menu, setMenu] = useState(false);
  const filtered = useMemo(() => movies.filter((m) => {
    const text = `${m.title} ${m.channel} ${m.area} ${m.year} ${m.state}`.toLowerCase();
    return (!keyword || text.includes(keyword.toLowerCase())) && (channel === "全部" || m.channel === channel);
  }), [keyword, channel]);
  const go = (next) => { setPage(next); setMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <>
      <Header page={page} go={go} menu={menu} setMenu={setMenu} />
      <main>
        {page === "home" && <HomePage go={go} setActive={setActive} />}
        {page === "library" && <Library filtered={filtered} keyword={keyword} setKeyword={setKeyword} channel={channel} setChannel={setChannel} setActive={setActive} />}
        {page === "channels" && <Channels go={go} setChannel={setChannel} />}
        {page === "rank" && <Rank setActive={setActive} />}
        {page === "search" && <SearchPage keyword={keyword} setKeyword={setKeyword} filtered={filtered} setActive={setActive} />}
        {page === "service" && <Service />}
      </main>
      <Footer go={go} />
      {active && <Detail movie={active} close={() => setActive(null)} />}
    </>
  );
}

function Header({ page, go, menu, setMenu }) {
  return <header className="header"><button className="brand" onClick={() => go("home")}><span>映</span><b>日韩影视网</b></button><button className="menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button><nav className={menu ? "nav open" : "nav"}>{nav.map(([label, key, Icon]) => <button key={key} className={page === key ? "on" : ""} onClick={() => go(key)}><Icon size={16} />{label}</button>)}</nav></header>;
}

function HomePage({ go, setActive }) {
  const hero = movies[0];
  return (
    <>
      <section className="portal-hero">
        <article className="main-story" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.96), rgba(255,255,255,.68)), url(${hero.wide})` }}>
          <span className="label"><Sparkles size={14} /> 今日头条</span>
          <h1>日韩电影在线与高清片库速览</h1>
          <p>{hero.intro} 站内整理日本电影、韩国电影、韩剧、日剧、动漫综艺和高分榜单。</p>
          <div className="actions"><button onClick={() => setActive(hero)}>查看详情</button><button onClick={() => go("library")}>进入片库</button></div>
        </article>
        <aside className="headline-rank">
          <h2><Flame size={20} /> 热播快讯</h2>
          {movies.slice(1, 7).map((m, i) => <button key={m.id} onClick={() => setActive(m)}><b>{i + 1}</b><span><strong>{m.title}</strong><em>{m.channel} · {m.score} 分</em></span></button>)}
        </aside>
      </section>
      <Section title="今日精选" label="Daily Picks" action="全部影片" onAction={() => go("library")}><CardGrid items={movies.slice(7, 19)} setActive={setActive} /></Section>
      <section className="topic-layout">
        <div><Head title="日韩热播" label="Hot Stream" action="热播榜" onAction={() => go("rank")} /><FeatureList items={movies.slice(19, 27)} setActive={setActive} /></div>
        <div><Head title="最新上架" label="New Release" action="搜索片库" onAction={() => go("search")} /><UpdateList items={movies.slice(27, 41)} setActive={setActive} /></div>
      </section>
      <section className="channel-box"><Head title="分类频道" label="Channels" action="全部频道" onAction={() => go("channels")} /><ChannelGrid go={go} setChannel={setChannelNoop} /></section>
      <section className="topic-layout">
        <div><Head title="高分推荐" label="Top Rated" /><MiniList items={[...movies].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 8)} setActive={setActive} /></div>
        <div><Head title="热播榜入口" label="Ranking" action="完整榜单" onAction={() => go("rank")} /><RankMini items={movies.slice(0, 8)} setActive={setActive} /></div>
      </section>
    </>
  );
}

function setChannelNoop() {}

function Library({ filtered, keyword, setKeyword, channel, setChannel, setActive }) {
  return <><PageTitle title="全部影片" label="Library" text="高密度片库收录日韩精选、韩剧热播、日剧推荐、日本电影、韩国电影、动作冒险、悬疑犯罪、爱情治愈、喜剧综艺和动漫动画。" /><Filters keyword={keyword} setKeyword={setKeyword} channel={channel} setChannel={setChannel} /><CardGrid items={filtered} setActive={setActive} dense /></>;
}
function Channels({ go, setChannel }) {
  return <><PageTitle title="分类频道" label="Channels" text="按题材、地区和观看心情进入频道，快速定位想看的日韩影视内容。" /><ChannelGrid go={go} setChannel={setChannel} large /></>;
}
function Rank({ setActive }) {
  return <><PageTitle title="热播榜" label="Ranking" text="按热度、评分和更新状态整理近期更受关注的日韩影视内容。" /><div className="rank-list">{[...movies].sort((a, b) => b.heat - a.heat).slice(0, 60).map((m, i) => <button key={m.id} onClick={() => setActive(m)}><b>{i + 1}</b><img src={m.poster} alt={m.title} /><span><strong>{m.title}</strong><em>{m.channel} · {m.area} · {m.year}</em></span><i>{m.score}</i></button>)}</div></>;
}
function SearchPage({ keyword, setKeyword, filtered, setActive }) {
  return <><PageTitle title="搜索片库" label="Search" text="输入片名、分类、地区、年份或更新状态，快速筛选站内影视内容。" /><div className="searchbar"><Search /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例如：日韩电影在线、韩剧、日本电影、2026" autoFocus /></div><CardGrid items={filtered} setActive={setActive} dense /></>;
}
function Service() {
  return <section className="service"><span>Support</span><h1>服务支持</h1><p>日韩影视网专注影视资料整理、分类索引与内容推荐，帮助用户发现更多值得关注的日韩影视作品。</p><div className="service-grid"><article><Newspaper /><h2>网站说明</h2><p>站内内容用于影视资料整理、片单推荐和分类索引展示。</p></article><article><ShieldCheck /><h2>版权声明</h2><p>片名、海报和文字介绍版权归原作者、出品方及发行方所有。</p></article><article><Mail /><h2>联系合作</h2><p>内容纠错、友情链接和合作事宜，可通过站点预留邮箱联系。</p></article></div><h2>免责声明</h2><p>本站不存储任何视频文件，不提供影视文件上传服务。如权利方认为页面信息需要调整，请提交说明，我们会及时处理。</p></section>;
}
function Section({ title, label, action, onAction, children }) { return <section className="section"><Head title={title} label={label} action={action} onAction={onAction} />{children}</section>; }
function Head({ title, label, action, onAction }) { return <div className="head"><div><span>{label}</span><h2>{title}</h2></div>{action && <button onClick={onAction}>{action}</button>}</div>; }
function PageTitle({ title, label, text }) { return <section className="page-title"><span>{label}</span><h1>{title}</h1><p>{text}</p></section>; }
function CardGrid({ items, setActive, dense }) { return <div className={dense ? "card-grid dense" : "card-grid"}>{items.map((m) => <MovieCard key={m.id} movie={m} setActive={setActive} />)}</div>; }
function MovieCard({ movie, setActive }) { return <button className="movie-card" onClick={() => setActive(movie)}><div><img src={movie.poster} alt={movie.title} loading="lazy" /><span>{movie.channel}</span><b>{movie.score}</b></div><strong>{movie.title}</strong><em>{movie.area} · {movie.year} · {movie.state}</em></button>; }
function FeatureList({ items, setActive }) { return <div className="feature-list">{items.map((m) => <button key={m.id} onClick={() => setActive(m)}><img src={m.wide} alt={m.title} /><span><strong>{m.title}</strong><em>{m.channel} · {m.score} 分</em></span></button>)}</div>; }
function UpdateList({ items, setActive }) { return <div className="updates">{items.map((m, i) => <button key={m.id} onClick={() => setActive(m)}><b>{String(i + 1).padStart(2, "0")}</b><span><strong>{m.title}</strong><em>{m.channel} · {m.area} · {m.year}</em></span><i>{m.state}</i></button>)}</div>; }
function ChannelGrid({ go, setChannel, large }) { return <div className={large ? "channels large" : "channels"}>{channels.map((c, i) => <button key={c.name} onClick={() => { setChannel(c.name); go("library"); }}><span>{String(i + 1).padStart(2, "0")}</span><strong>{c.name}</strong><em>{c.desc}</em><b>{movies.filter((m) => m.channel === c.name).length} 部</b></button>)}</div>; }
function MiniList({ items, setActive }) { return <div className="mini-list">{items.map((m) => <button key={m.id} onClick={() => setActive(m)}><img src={m.poster} alt={m.title} /><span><strong>{m.title}</strong><em>{m.channel} · {m.score} 分</em></span></button>)}</div>; }
function RankMini({ items, setActive }) { return <div className="rank-mini">{items.map((m, i) => <button key={m.id} onClick={() => setActive(m)}><b>{i + 1}</b><span>{m.title}</span><em>{m.heat}</em></button>)}</div>; }
function Filters({ keyword, setKeyword, channel, setChannel }) { return <section className="filters"><div><Search size={18} /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索影片名、分类、地区或年份" /></div><nav>{["全部", ...channels.map((c) => c.name)].map((name) => <button key={name} className={channel === name ? "active" : ""} onClick={() => setChannel(name)}>{name}</button>)}</nav></section>; }
function Detail({ movie, close }) { return <div className="overlay" onClick={close}><article className="detail" onClick={(e) => e.stopPropagation()}><button className="close" onClick={close}><X /></button><img src={movie.poster} alt={movie.title} /><section><span className="label"><Tv size={14} /> {movie.channel}</span><h2>{movie.title}</h2><div className="meta"><span><Star size={14} /> {movie.score}</span><span>{movie.area}</span><span>{movie.year}</span><span>{movie.state}</span></div><p>{movie.intro}</p><dl><dt>导演</dt><dd>{movie.director}</dd><dt>主演</dt><dd>{movie.cast}</dd></dl><button onClick={close}>继续浏览</button></section></article></div>; }
function Footer({ go }) { return <footer className="footer"><div><strong>日韩影视网</strong><p>专注日韩电影、电视剧、综艺与动漫内容整理，发现更多值得观看的亚洲影像故事。</p></div><nav><button onClick={() => go("library")}>全部影片</button><button onClick={() => go("channels")}>分类频道</button><button onClick={() => go("rank")}>热播榜</button><button onClick={() => go("service")}>免责声明</button></nav><div><b>友情链接</b><a href="#">日韩剧场</a><a href="#">亚洲影评</a><a href="#">电影片单</a></div><p className="copy">© 2026 日韩影视网. 本站仅提供影视信息整理与推荐，相关版权归原作者及发行方所有。联系邮箱：contact@example.com</p></footer>; }
createRoot(document.getElementById("root")).render(<App />);

