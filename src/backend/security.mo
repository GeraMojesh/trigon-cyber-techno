import Array "mo:base/Array";
import Time "mo:base/Time";

module Security {

    public type Log = {
        level: Text;
        message: Text;
        timestamp: Int;
    };

    var logs : [Log] = [];

    public func logEvent(level : Text, message : Text) {
        let t = Time.now();
        logs := Array.append<Log>(logs, [{ level = level; message = message; timestamp = t }]);
    };

    public func getLogs() : [Log] {
        return logs;
    };
}
