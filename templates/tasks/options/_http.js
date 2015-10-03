module.exports = {
    remoteDatabases: {
        options: {
            url: '<%= remoteDatabase.url %>'
        },
        dest: 'config/data/<%= remoteDatabase.url.match(/([^\/]*)$/)[0] %>'
    }
}