let exec = Promise.promisify(require('child_process').exec)

module.exports = app => {
	// Aero manager info
	app.server.routes.GET['api/aero/info'] = Promise.coroutine(function*(request, response) {
		let os = yield {
			name: exec('lsb_release -i -s').then(x => x.trim()),
			version: exec('lsb_release -r -s').then(x => x.trim())
		}

		let cpu = yield {
			usage: exec("grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print int(usage)}'").then(x => parseInt(x))
		}

		let memory = yield {
			usage: exec("free | grep Mem | awk '{print int($3/$2 * 100.0)}'").then(x => parseInt(x))
		}

		let disk = {
			space: yield {
				used: exec("df -h -x tmpfs / | awk '{print $5}' | grep [0-9]% | awk '{print $1}'").then(x => parseInt(x))
			}
		}

		response.json({
			aero: {
				version: app.version,
				averageResponseTime: app.averageResponseTime,
				averageCodeSize: app.averageCodeSize
			},
			node: {
				version: process.version.replace('v', '')
			},
			os,
			hardware: {
				cpu,
				memory,
				disk
			}
		})
	})
}