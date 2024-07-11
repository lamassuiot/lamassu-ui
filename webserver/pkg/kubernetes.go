package pkg

import (
	"context"
	"os"

	coreV1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"

	"k8s.io/client-go/tools/clientcmd"
)

type HLKubernetesClient struct {
	Client    *kubernetes.Clientset
	ExtClient *dynamic.DynamicClient
}

func NewHighLevelKubernetesClient() (*HLKubernetesClient, error) {
	kubeconfig := os.Getenv("HOME") + "/.kube/config"
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		return nil, err
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	extCli, err := dynamic.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return &HLKubernetesClient{
		Client:    clientset,
		ExtClient: extCli,
	}, nil
}

func (hlCli *HLKubernetesClient) CreateTLSSecret(secretName, tlsCert, tlsKey string) error {
	var secretSpec coreV1.Secret

	secretSpec.Name = secretName
	secretSpec.Type = coreV1.SecretTypeTLS
	secretSpec.Data = map[string][]byte{}
	secretSpec.Data[coreV1.TLSCertKey] = []byte(tlsCert)
	secretSpec.Data[coreV1.TLSPrivateKeyKey] = []byte(tlsKey)

	secretsClient := hlCli.Client.CoreV1().Secrets("default")
	_, err := secretsClient.Create(context.Background(), &secretSpec, v1.CreateOptions{})
	if err != nil {
		return err
	}

	return nil
}

func (hlCli *HLKubernetesClient) GetCertManagerIssuer() ([]string, error) {
	return []string{}, nil
}

func (hlCli *HLKubernetesClient) GetCertManagerClusterIssuer() ([]string, error) {
	return []string{}, nil
}
