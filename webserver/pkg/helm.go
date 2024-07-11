package pkg

import (
	"context"
	"fmt"
	"os"
	"strings"

	helmclient "github.com/mittwald/go-helm-client"
	"gopkg.in/yaml.v3"
	"helm.sh/helm/v3/pkg/release"
	"helm.sh/helm/v3/pkg/repo"
)

type HLHelmClient struct {
	client             helmclient.Client
	lamassuInstallName string
}

func NewHighLevelHelmClient(namespace, lamassuInstallName string) (*HLHelmClient, error) {
	opt := &helmclient.Options{
		Namespace:        namespace, // Change this to the namespace you wish the client to operate in.
		RepositoryCache:  "$HOME/Library/Caches/helm",
		RepositoryConfig: "$HOME/Library/Preferences/helm",
		Debug:            true,
		Linting:          true,
		DebugLog:         func(format string, v ...interface{}) {},
		Output:           os.Stdout, // Not mandatory, leave open for default os.Stdout
	}

	helmCli, err := helmclient.New(opt)
	if err != nil {
		return nil, err
	}

	err = helmCli.AddOrUpdateChartRepo(repo.Entry{
		Name: "lamassuiot",
		URL:  "https://www.lamassu.io/lamassu-helm",
	})

	if err != nil {
		return nil, err
	}

	return &HLHelmClient{
		lamassuInstallName: lamassuInstallName,
		client:             helmCli,
	}, nil
}

func (svc *HLHelmClient) GetLamassuReleases() ([]string, error) {
	file, err := repo.LoadIndexFile(svc.client.GetSettings().RepositoryCache + "/lamassuiot-index.yaml")
	if err != nil {
		return []string{}, err
	}

	lamassuChartVersions := []string{}
	for _, entry := range file.Entries {
		for _, version := range entry {
			if version.Name == "lamassu" {
				lamassuChartVersions = append(lamassuChartVersions, version.Version)
			}
		}
	}

	return lamassuChartVersions, err
}

func (svc *HLHelmClient) GetCurrentReleaseValues() (*release.Release, map[string]interface{}, error) {
	values, err := svc.client.GetReleaseValues(svc.lamassuInstallName, false)
	if err != nil {
		return nil, nil, err
	}

	release, err := svc.client.GetRelease(svc.lamassuInstallName)
	if err != nil {
		return nil, nil, err
	}

	return release, values, nil
}

func (svc *HLHelmClient) UpdateConfigLamassuRelease(domain string, monitoringCron string) error {
	values, err := svc.client.GetReleaseValues(svc.lamassuInstallName, false)
	if err != nil {
		return err
	}

	values, err = yamlSetValue(values, "domain", domain)
	if err != nil {
		return err
	}

	values, err = yamlSetValue(values, "services.ca.monitoring.frequency", monitoringCron)
	if err != nil {
		return err
	}

	valuesB, err := yaml.Marshal(values)
	if err != nil {
		return err
	}

	_, err = svc.client.UpgradeChart(context.Background(), &helmclient.ChartSpec{
		ReleaseName: svc.lamassuInstallName,
		ChartName:   "lamassuiot/lamassu",
		Namespace:   svc.client.GetSettings().Namespace(),
		ValuesYaml:  string(valuesB),
	}, &helmclient.GenericHelmOptions{})
	if err != nil {
		return err
	}

	return nil
}

func yamlSetValue(yamlMap map[string]any, keyPath string, value any) (map[string]any, error) {
	subPaths := strings.Split(keyPath, ".")
	if len(subPaths) > 1 {
		if _, ok := yamlMap[subPaths[0]]; ok {
			subMapB, err := yaml.Marshal(yamlMap[subPaths[0]])
			if err != nil {
				return nil, err
			}

			fmt.Println(string(subMapB))

			var subMap map[string]any
			err = yaml.Unmarshal(subMapB, &subMap)
			if err != nil {
				return nil, err
			}

			newSubMap, err := yamlSetValue(subMap, strings.Join(subPaths[1:], "."), value)
			if err != nil {
				return nil, err
			}

			yamlMap[subPaths[0]] = newSubMap

			return yamlMap, nil
		} else {
			newSubMap, err := yamlSetValue(map[string]any{}, strings.Join(subPaths[1:], "."), value)
			if err != nil {
				return nil, err
			}

			yamlMap[subPaths[0]] = newSubMap
			return yamlMap, nil
		}
	} else {
		yamlMap[keyPath] = value
		return yamlMap, nil
	}
}
