package main

import (
	"fmt"

	"github.com/lamassuiot/lamassu-ui/webserver/pkg"
)

func main() {
	_, err := pkg.NewHighLevelKubernetesClient()
	chk(err)

	hlHelmCli, err := pkg.NewHighLevelHelmClient("default", "lamassu")
	chk(err)

	// err = hlHelmCli.UpdateConfigLamassuRelease("lab.lamassu.io", "1 * * * *")
	chk(err)

	versions, err := hlHelmCli.GetLamassuReleases()
	chk(err)

	fmt.Println(versions)
}

func chk(err error) {
	if err != nil {
		panic(err)
	}
}
