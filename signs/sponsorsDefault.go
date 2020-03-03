package signs

func defaultSponsors() Sponsors {
	return Sponsors{
		"platinum": []string{
			"ibm",
		},
		"diamond": []string{
			"microsoft",
		},
		"gold": []string{
			"chef",
			"redhat",
			"victorops",
			"logz",
			"gitlab",
			"transformix",
			"skysilk",
			"vmware",
			"elastic",
			"facebook",
			"stackrox",
			"cncf",
		},
		"ballrooma": []string{
			"ubuntu",
		},
		"ballroomb": []string{
			"arrikto",
			"ubuntu",
			"gcp",
			"maven",
			"microsoft",
		},
	}
}
