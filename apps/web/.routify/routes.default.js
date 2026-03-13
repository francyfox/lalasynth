// @ts-nocheck


export const routes = {
  "meta": {},
  "id": "_default",
  "name": "",
  "file": {
    "path": "src/routes/_module.svelte",
    "dir": "src/routes",
    "base": "_module.svelte",
    "ext": ".svelte",
    "name": "_module"
  },
  "asyncModule": () => import('../src/routes/_module.svelte'),
  "rootName": "default",
  "routifyDir": import.meta.url,
  "children": [
    {
      "meta": {
        "dynamic": true,
        "order": false,
        "dynamicSpread": true
      },
      "id": "_default_____404__svelte",
      "name": "[...404]",
      "file": {
        "path": "src/routes/[...404].svelte",
        "dir": "src/routes",
        "base": "[...404].svelte",
        "ext": ".svelte",
        "name": "[...404]"
      },
      "asyncModule": () => import('../src/routes/[...404].svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_auth",
      "name": "auth",
      "module": false,
      "file": {
        "path": "src/routes/auth",
        "dir": "src/routes",
        "base": "auth",
        "ext": "",
        "name": "auth"
      },
      "children": [
        {
          "meta": {
            "isDefault": true
          },
          "id": "_default_auth_index_svelte",
          "name": "index",
          "file": {
            "path": "src/routes/auth/index.svelte",
            "dir": "src/routes/auth",
            "base": "index.svelte",
            "ext": ".svelte",
            "name": "index"
          },
          "asyncModule": () => import('../src/routes/auth/index.svelte'),
          "children": []
        }
      ]
    },
    {
      "meta": {},
      "id": "_default_game",
      "name": "game",
      "module": false,
      "file": {
        "path": "src/routes/game",
        "dir": "src/routes",
        "base": "game",
        "ext": "",
        "name": "game"
      },
      "children": [
        {
          "meta": {
            "isDefault": true,
            "_auth": true
          },
          "id": "_default_game_index_svelte",
          "name": "index",
          "file": {
            "path": "src/routes/game/index.svelte",
            "dir": "src/routes/game",
            "base": "index.svelte",
            "ext": ".svelte",
            "name": "index"
          },
          "asyncModule": () => import('../src/routes/game/index.svelte'),
          "children": []
        }
      ]
    },
    {
      "meta": {
        "isDefault": true
      },
      "id": "_default_index_svelte",
      "name": "index",
      "file": {
        "path": "src/routes/index.svelte",
        "dir": "src/routes",
        "base": "index.svelte",
        "ext": ".svelte",
        "name": "index"
      },
      "asyncModule": () => import('../src/routes/index.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_lobby",
      "name": "lobby",
      "module": false,
      "file": {
        "path": "src/routes/lobby",
        "dir": "src/routes",
        "base": "lobby",
        "ext": "",
        "name": "lobby"
      },
      "children": [
        {
          "meta": {
            "isDefault": true,
            "_auth": true
          },
          "id": "_default_lobby_index_svelte",
          "name": "index",
          "file": {
            "path": "src/routes/lobby/index.svelte",
            "dir": "src/routes/lobby",
            "base": "index.svelte",
            "ext": ".svelte",
            "name": "index"
          },
          "asyncModule": () => import('../src/routes/lobby/index.svelte'),
          "children": []
        }
      ]
    },
    {
      "meta": {},
      "id": "_default_menu",
      "name": "menu",
      "module": false,
      "file": {
        "path": "src/routes/menu",
        "dir": "src/routes",
        "base": "menu",
        "ext": "",
        "name": "menu"
      },
      "children": [
        {
          "meta": {
            "isDefault": true,
            "_auth": true
          },
          "id": "_default_menu_index_svelte",
          "name": "index",
          "file": {
            "path": "src/routes/menu/index.svelte",
            "dir": "src/routes/menu",
            "base": "index.svelte",
            "ext": ".svelte",
            "name": "index"
          },
          "asyncModule": () => import('../src/routes/menu/index.svelte'),
          "children": []
        }
      ]
    },
    {
      "meta": {},
      "id": "_default_terms",
      "name": "terms",
      "module": false,
      "file": {
        "path": "src/routes/terms",
        "dir": "src/routes",
        "base": "terms",
        "ext": "",
        "name": "terms"
      },
      "children": [
        {
          "meta": {
            "isDefault": true,
            "_skip": true
          },
          "id": "_default_terms_index_svelte",
          "name": "index",
          "file": {
            "path": "src/routes/terms/index.svelte",
            "dir": "src/routes/terms",
            "base": "index.svelte",
            "ext": ".svelte",
            "name": "index"
          },
          "asyncModule": () => import('../src/routes/terms/index.svelte'),
          "children": []
        }
      ]
    }
  ]
}
export default routes