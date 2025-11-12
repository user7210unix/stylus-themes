// ==UserScript==
// @name         4chan Permanent Sidebar
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Adds the /frames sidebar to all 4chan pages
// @author       You
// @match        https://boards.4chan.org/*
// @match        https://boards.4channel.org/*
// @grant        GM_xmlhttpRequest
// @connect      boards.4chan.org
// @connect      boards.4channel.org
// ==/UserScript==

(function() {
    'use strict';

    // Don't run on frames page itself
    if (window.location.pathname === '/frames' || window.location.pathname === '/frames/') return;

    // Board list from 4chan
    const boards = {
        'Japanese Culture': ['a', 'c', 'w', 'm', 'cgl', 'cm', 'f', 'n', 'jp', 'vip'],
        'Video Games': ['v', 'vg', 'vm', 'vmg', 'vp', 'vr', 'vrpg', 'vst'],
        'Interests': ['co', 'g', 'tv', 'k', 'o', 'an', 'tg', 'sp', 'xs', 'pw', 'sci', 'his', 'int', 'out', 'toy'],
        'Creative': ['i', 'po', 'p', 'ck', 'ic', 'wg', 'lit', 'mu', 'fa', ' 3', 'gd', 'diy', 'wsg', 'qst'],
        'Other': ['biz', 'trv', 'fit', 'x', 'adv', 'lgbt', 'mlp', 'news', 'wsr', 'vip'],
        'Misc': ['b', 'r9k', 'pol', 'bant', 'soc', 's4s', 's', 'hc', 'hm', 'h', 'e', 'u', 'd', 'y', 't', 'hr', 'gif', 'aco', 'r']
    };

    const boardNames = {
        'a': 'Anime & Manga', 'c': 'Anime/Cute', 'w': 'Anime/Wallpapers', 'm': 'Mecha',
        'cgl': 'Cosplay & EGL', 'cm': 'Cute/Male', 'f': 'Flash', 'n': 'Transportation',
        'jp': 'Otaku Culture', 'v': 'Video Games', 'vg': 'Video Game Generals',
        'vm': 'Video Games/Multiplayer', 'vmg': 'Video Games/Mobile', 'vp': 'Pokémon',
        'vr': 'Retro Games', 'vrpg': 'Video Games/RPG', 'vst': 'Video Games/Strategy',
        'co': 'Comics & Cartoons', 'g': 'Technology', 'tv': 'Television & Film',
        'k': 'Weapons', 'o': 'Auto', 'an': 'Animals & Nature', 'tg': 'Traditional Games',
        'sp': 'Sports', 'xs': 'Extreme Sports', 'pw': 'Professional Wrestling',
        'sci': 'Science & Math', 'his': 'History & Humanities', 'int': 'International',
        'out': 'Outdoors', 'toy': 'Toys', 'i': 'Oekaki', 'po': 'Papercraft & Origami',
        'p': 'Photography', 'ck': 'Food & Cooking', 'ic': 'Artwork/Critique',
        'wg': 'Wallpapers/General', 'lit': 'Literature', 'mu': 'Music', 'fa': 'Fashion',
        '3': '3DCG', 'gd': 'Graphic Design', 'diy': 'Do It Yourself', 'wsg': 'Worksafe GIF',
        'qst': 'Quests', 'biz': 'Business & Finance', 'trv': 'Travel', 'fit': 'Fitness',
        'x': 'Paranormal', 'adv': 'Advice', 'lgbt': 'LGBT', 'mlp': 'Pony',
        'news': 'Current News', 'wsr': 'Worksafe Requests', 'vip': 'Very Important Posts',
        'b': 'Random', 'r9k': 'ROBOT9001', 'pol': 'Politically Incorrect', 'bant': 'International/Random',
        'soc': 'Cams & Meetups', 's4s': 'Shit 4chan Says', 's': 'Sexy Beautiful Women',
        'hc': 'Hardcore', 'hm': 'Handsome Men', 'h': 'Hentai', 'e': 'Ecchi',
        'u': 'Yuri', 'd': 'Hentai/Alternative', 'y': 'Yaoi', 't': 'Torrents',
        'hr': 'High Resolution', 'gif': 'Adult GIF', 'aco': 'Adult Cartoons', 'r': 'Adult Requests'
    };

    // Create sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar-frame';
    sidebar.className = 'theme-adaptive-sidebar';
    sidebar.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 200px;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 9999;
        padding: 10px;
        box-sizing: border-box;
    `;

    // Build sidebar HTML
    let html = '';
    
    for (const [category, boardList] of Object.entries(boards)) {
        html += `<div style="margin-bottom: 10px;">`;
        html += `<div class="sidebar-category" style="font-weight: bold; margin-bottom: 3px;">[${category}]</div>`;
        
        for (const board of boardList) {
            const name = boardNames[board] || board;
            const isNSFW = ['s', 'hc', 'hm', 'h', 'e', 'u', 'd', 'y', 't', 'hr', 'gif', 'aco', 'r'].includes(board);
            const domain = isNSFW ? 'boards.4chan.org' : 'boards.4channel.org';
            
            html += `<div style="margin: 1px 0;">
                <a href="https://${domain}/${board}/" 
                   class="sidebar-link ${isNSFW ? 'nsfw-link' : 'sfw-link'}"
                   style="text-decoration: none; font-size: 9pt;">
                    /${board}/ - ${name}
                </a>
            </div>`;
        }
        
        html += `</div>`;
    }

    sidebar.innerHTML = html;

    // Adjust main content
    const style = document.createElement('style');
    style.textContent = `
        /* Classic Yotsuba/Futaba color scheme */
        #sidebar-frame {
            background: #feffee;
            border-right: 1px solid #d9bfb7;
            color: #6a0005;
            font-family: arial, helvetica, sans-serif;
            font-size: 10pt;
        }
        
        .sidebar-link {
            color: #190080;
            font-weight: normal;
        }
        
        .sidebar-link:visited {
            color: #6a0005;
        }
        
        .sidebar-category {
            color: #6a0005;
            text-transform: uppercase;
            font-size: 8pt;
        }
        
        .nsfw-link {
            color: #190080;
        }
        
        .nsfw-link:visited {
            color: #6a0005;
        }
        
        /* Shift everything for sidebar - use !important to work across browsers */
        body {
            margin-left: 200px !important;
            padding-left: 0 !important;
        }
        
        /* 4chan X header bar compatibility */
        #header-bar,
        .header-bar {
            left: 200px !important;
            width: calc(100% - 200px) !important;
        }
        
        /* Adjust all main containers */
        #boardNavDesktop,
        #boardNavDesktopFoot,
        .desktop,
        #togglePostFormLink,
        .board,
        #content,
        .pagelist,
        .pages,
        .boardBanner {
            margin-left: 0 !important;
            padding-left: 0 !important;
        }
        
        /* Fix centering for catalog and thread pages */
        .center,
        .thread,
        .postContainer,
        #delform {
            max-width: calc(100vw - 220px) !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
        
        /* 4chan X specific fixes */
        #notifications {
            left: 200px !important;
        }
        
        .fixed {
            left: 200px !important;
        }
        
        /* Catalog grid fix */
        #threads {
            margin-left: 0 !important;
        }
    `;

    // Initialize
    function init() {
        document.head.appendChild(style);
        document.body.insertBefore(sidebar, document.body.firstChild);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();