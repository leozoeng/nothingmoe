-- Attach Discord invite links for AnimeX and YumeZone.

update public.nothingmoe_sites
set discord = 'https://discord.gg/pzqHBKHK7m'
where domain = 'animex.one';

update public.nothingmoe_sites
set discord = 'https://discord.gg/AZwZbpReNx'
where domain = 'yumezone.live';
