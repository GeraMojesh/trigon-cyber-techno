import Time "mo:base/Time";
import Storage "storage";
import API "api";
import Security "security";

actor TrigonBackend {

    public query func getCompanyInfo() : async { company: Text; domain: Text; founder: Text; coFounder: Text } {
        return API.getCompanyInfo();
    };

    public query func getPartner() : async { organization: Text; representative: Text; website: Text } {
        return API.getPartner();
    };

    public query func getProjects() : async [Storage.Project] {
        return API.getProjects();
    };

    public query func getFeatures() : async [Text] {
        return API.getFeatures();
    };

    public query func getServices() : async [Text] {
        return API.getServices();
    };

    public query func getTools() : async [Text] {
        return API.getTools();
    };

    public query func getNews() : async [Text] {
        return API.getNews();
    };

    public query func getFields() : async [Text] {
        return API.getFields();
    };

    public query func getSystemState() : async Storage.SystemState {
        return API.getSystemState();
    };

    public query func getLogs() : async [Security.Log] {
        return Security.getLogs();
    };

    public shared func storeMessage(name : Text, email : Text, content : Text) : async Text {
        let msg : Storage.Message = {
            name = name;
            email = email;
            content = content;
            timestamp = Time.now();
        };
        Storage.addMessage(msg);
        Security.logEvent("INFO", "Message received from: " # name);
        return "Message stored securely in Trigon Canister.";
    };
}
