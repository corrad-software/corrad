export default [
  {
    "header": "",
    "description": "",
    "child": [
      {
        "title": "Dashboard",
        "path": "/dashboard",
        "icon": "ic:outline-dashboard",
        "child": [],
        "meta": {}
      }
    ]
  },
  {
    "header": "Playground",
    "description": "Component playground",
    "child": [
      {
        "title": "Component playground",
        "path": "/playground/test",
        "icon": "material-symbols:play-shapes-outline-rounded",
        "child": [],
        "meta": {}
      }
    ],
    "meta": {}
  },
  {
    "header": "Customer",
    "description": "Manage your customer",
    "child": [
      {
        "title": "User",
        "path": "/customer/Listing",
        "icon": "mdi:users",
        "child": [],
        "meta": {
          "auth": {
            "role": [
              "haqeem_role_1",
              "Admin",
              "Developer"
            ]
          }
        }
      },
      {
        "title": "Add User",
        "path": "/customer/AddUser",
        "icon": "mdi:add",
        "child": [],
        "meta": {
          "auth": {
            "role": [
              "haqeem_role_2",
              "Admin",
              "Developer"
            ]
          }
        }
      },
      {
        "title": "Edit User",
        "path": "/customer/EditUser",
        "icon": "mdi:edit",
        "child": [],
        "meta": {
          "auth": {
            "role": [
              "haqeem_role_3",
              "Admin",
              "Developer"
            ]
          }
        }
      },
      {
        "title": "Menu",
        "path": "/haqeem/user",
        "icon": "mdi:menu",
        "child": [
          {
            "title": "Sub menu",
            "path": "/haqeem/user/list",
            "icon": "icon-park-twotone:more-four",
            "child": [],
            "meta": {}
          },
          {
            "title": "Sub menu 2",
            "path": "/haqeem/user/list-2",
            "icon": "icon-park-twotone:more-four",
            "child": [],
            "meta": {}
          }
        ],
        "meta": {}
      }
    ],
    "meta": {}
  },
  {
    "header": "Administration",
    "description": "Manage your application",
    "child": [
      {
        "title": "Configuration",
        "icon": "ic:outline-settings",
        "child": [
          {
            "title": "Environment",
            "path": "/devtool/config/environment"
          }
        ]
      },
      {
        "title": "Menu Editor",
        "icon": "ci:menu-alt-03",
        "path": "/devtool/menu-editor",
        "child": []
      },
      {
        "title": "Manage Users",
        "path": "/devtool/user-management",
        "icon": "ph:user-circle-gear",
        "child": [
          {
            "title": "User List",
            "path": "/devtool/user-management/user-list",
            "icon": "",
            "child": []
          },
          {
            "title": "Role List",
            "path": "/devtool/user-management/role-list",
            "icon": "",
            "child": []
          }
        ]
      },
      {
        "title": "Content",
        "icon": "mdi:pencil-ruler",
        "child": [
          {
            "title": "Editor",
            "path": "/devtool/content-editor"
          },
          {
            "title": "Template",
            "path": "/devtool/content-editor/template"
          }
        ]
      },
      {
        "title": "API Editor",
        "path": "/devtool/api-editor",
        "icon": "material-symbols:api-rounded",
        "child": []
      },
      {
        "title": "Code Playground",
        "path": "/devtool/code-playground",
        "icon": "mdi:code-braces",
        "child": []
      }
    ],
    "meta": {
      "auth": {
        "role": [
          "Developer"
        ]
      }
    }
  },
  {
    "header": "Help",
    "description": "Help and documentation",
    "child": [
      {
        "title": "Documentation",
        "icon": "solar:book-bookmark-minimalistic-bold",
        "path": "https://mawar-cms-docs.vercel.app",
        "external": true
      },
      {
        "title": "UI Components",
        "icon": "material-symbols:settings-input-component-outline-rounded",
        "path": "https://ui.corrad.ai",
        "external": true
      }
    ],
    "meta": {
      "auth": {
        "role": [
          "Developer"
        ]
      }
    }
  }
]