import Storage "storage";

module API {
    public func getCompanyInfo() : { company: Text; domain: Text; founder: Text; coFounder: Text } {
        return {
            company = "Trigon";
            domain = "Cybersecurity & Artificial Intelligence";
            founder = "G Mojesh";
            coFounder = "J Vinay";
        };
    };

    public func getPartner() : { organization: Text; representative: Text; website: Text } {
        return {
            organization = "Sripto";
            representative = "Y Sri Vardhan";
            website = "sripto.tech";
        };
    };

    public func getProjects() : [Storage.Project] {
        return Storage.projects;
    };

    public func getFeatures() : [Text] {
        return Storage.features;
    };

    public func getServices() : [Text] {
        return Storage.services;
    };

    public func getTools() : [Text] {
        return Storage.tools;
    };

    public func getSystemState() : Storage.SystemState {
        return Storage.state;
    };

    public func getNews() : [Text] {
        return Storage.news;
    };

    public func getFields() : [Text] {
        return Storage.fields;
    };
}
