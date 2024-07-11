package main

import (
	"fmt"

	"github.com/lamassuiot/lamassu-ui/webserver/pkg"
)

func main() {
	_, err := pkg.NewHighLevelKubernetesClient()
	chk(err)

	hlHelmCli, err := pkg.NewHighLevelHelmClient("lamassu-dev", "lamassu")
	chk(err)

	// err = hlHelmCli.UpdateConfigLamassuRelease("lab.lamassu.io", "1 * * * *")
	chk(err)

	versions, err := hlHelmCli.GetLamassuReleases()
	chk(err)

	release, values, err := hlHelmCli.GetCurrentReleaseValues()
	chk(err)

	fmt.Println("Release:")
	fmt.Println(release.Chart.AppVersion())
	fmt.Println(release.Chart.Metadata.Version)
	fmt.Println(release.Namespace)

	fmt.Println("Values:")
	fmt.Println(values)

	fmt.Println("Versions:")

	fmt.Println(versions)
}

func chk(err error) {
	if err != nil {
		panic(err)
	}
}
