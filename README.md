# Meteor Addon Website
Meteor Addon "Shop" built with Firebase Studio

![image](https://github.com/user-attachments/assets/8d925941-eb53-4433-aeff-76a6f45c5ba8)


## 🚀 Main Features

| Feature | Description |
|---------|-------------|
| 🔍 **Search** | Search addons by name, author, or feature |
| 📊 **Filter** | Filter by game version and last updated time
| 📑 **Sort** | Sort results by Stars , Downloads , Last Updated, or Name. Hide or Show "Verified" addons.

## 🖥️ Control Panel
> 💡 Available at /control-panel
> 
> 🔧 Set the username and password in apphosting.yml

| Feature | Description |
|---------|-------------|
| ⚙️ **Database Control** | Verify addons or remove them from the database |
| ♻️ **Manual Updates** | Trigger a re-run of the addon scraper at any time

## 🔌 API
| Endpoint | Description |
|---------|-------------|
|  **/api/addons/all** | Returns full addon datebase |
|  **/api/addons/search** | Returns a filtered and sorted list of addons based on query parameters. |
|  **/api/refresh?token=YOUR_SECRET_TOKEN** | Trigger a re-run of the addon scraper

### Search API Paramaters
| Param | Description |
|---------|-------------|
|  **q** | The search term |
|  **sortBy** | The sort key. Can be one of: stars, downloads, last_update, name. Defaults to stars. |

