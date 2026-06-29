import Array "mo:base/Array";

module Storage {

    public type Project = {
        name: Text;
        description: Text;
        status: Text;
    };

    public type Message = {
        name: Text;
        email: Text;
        content: Text;
        timestamp: Int;
    };

    public type SystemState = {
        networkStatus: Text;
        infrastructure: Text;
        securityMode: Text;
        version: Text;
    };

    public let projects : [Project] = [
        { name = "CyberOS Terminal Platform"; description = "Decentralized operations terminal"; status = "Active" },
        { name = "Trigon Threat Scanner"; description = "Vulnerability detection engine"; status = "Active" },
        { name = "AI Security Engine"; description = "Machine learning threat detection"; status = "Beta" }
    ];

    public let services : [Text] = [
        "AI Threat Detection",
        "Phishing Email Analyzer",
        "Malicious Link Scanner",
        "Steganography Detection",
        "Cyber Intelligence Engine",
        "Enterprise Security Dashboards"
    ];

    public let features : [Text] = [
        "AI Threat Detection",
        "Phishing Email Analyzer",
        "Malicious Link Scanner",
        "Steganography Detection",
        "Cyber Intelligence Engine",
        "Enterprise Security Dashboards"
    ];

    public let tools : [Text] = [
        "Phishing scanner",
        "Link analyzer",
        "Steganography detector"
    ];

    public let news : [Text] = [
        "AI Threat Engine v1.2 Released",
        "New phishing detection module deployed",
        "Steganography research published"
    ];

    public let fields : [Text] = [
        "Cybersecurity",
        "Artificial Intelligence",
        "Threat Intelligence",
        "Security Analytics",
        "Digital Risk Monitoring"
    ];

    public let state : SystemState = {
        networkStatus = "Online";
        infrastructure = "Internet Computer Protocol";
        securityMode = "Active";
        version = "Trigon CyberOS v1.0";
    };

    var messages : [Message] = [];

    public func addMessage(msg : Message) {
        messages := Array.append<Message>(messages, [msg]);
    };

    public func getMessages() : [Message] {
        return messages;
    };
}
