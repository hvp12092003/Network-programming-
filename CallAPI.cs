using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using HVPUnityBase.Base.DesignPattern;
using System.Text;
using GameNamespace;
public class CallAPI : MonoBehaviour
{
    public string username;
    public string password;
    public string jsonBodyLogin, jsonBodyPost;
    public string token;

    Response response;
    GameNamespace.UserDataPost postData;
    void Start()
    {
        postData = new GameNamespace.UserDataPost();
        response = new Response();
    }
    public void ButtonRegister()
    {
        ResetData();
        //register
        StartCoroutine(Regisger("http://localhost:5000/api/register", jsonBodyLogin));
    }
    public void ButtonLogin()
    {
        ResetData();
        //login
        StartCoroutine(Login("http://localhost:5000/api/login", jsonBodyLogin));
    }
    public void ButtonChangeData()
    {
        ResetData();
        //login
        StartCoroutine(ChangeData("http://localhost:5000/api/patch", jsonBodyLogin, token));
    }
    public void ResetData()
    {
        postData.username = this.username;
        postData.password = this.password;

        this.jsonBodyLogin = JsonUtility.ToJson(postData);
    }
    IEnumerator Login(string url, string jsonBody)
    {
        Debug.Log("Sending JSON: " + jsonBody); 

        UnityWebRequest request = new UnityWebRequest(url, "POST");
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Response: " + request.downloadHandler.text);
            response = JsonUtility.FromJson<Response>(request.downloadHandler.text);
            if (response != null && response.userData != null)
            {
                this.token = response.token;
                Debug.Log($"Message: {response.message}");
                Debug.Log($"Token: {response.token}");
                Debug.Log($"Username: {response.userData.username}");
                Debug.Log($"NickName: {response.userData.nickName}");
                Debug.Log($"Coin: {response.userData.coin}");
                Debug.Log($"PointRank: {response.userData.pointRank}");
                Debug.Log($"LevelOfHeroes: {string.Join(",", response.userData.levelOfHeroes)}");
                Debug.Log($"PointOfDungeon: {string.Join(",", response.userData.pointOfDungeon)}");
            }
            else
            {
                Debug.LogError("Không nhận được dữ liệu người dùng từ API.");
            }

        }
        else
        {
            Debug.LogError("Error: " + request.error);
        }
    }
   

    IEnumerator Regisger(string url, string jsonBody)
    {
        Debug.Log("Sending JSON: " + jsonBody); // In payload gửi từ Unity

        UnityWebRequest request = new UnityWebRequest(url, "POST");
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Response: " + request.downloadHandler.text);
        }
        else
        {
            Debug.LogError($"Error: {request.error}, Response: {request.downloadHandler.text}");
        }
    }
    IEnumerator ChangeData(string url, string jsonBody, string token)
    {

        UnityWebRequest request = new UnityWebRequest(url, "PATCH");
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBodyPost);

        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        request.SetRequestHeader("Authorization", $"Bearer {token}");
        Debug.Log("Sending JSON: " + jsonBody + " Sending token: " + token); // In payload gửi từ Unity
        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Response: " + request.downloadHandler.text);
        }
        else
        {
            Debug.LogError($"Error: {request.error}, Response: {request.downloadHandler.text}");
        }
    }
}

public class API : SingletonMonoBehaviour<CallAPI> { }
